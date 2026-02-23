"""NAV Online Számla API v3.0 client — queryTaxpayer implementation."""

import hashlib
import logging
import time
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_NS_API = "http://schemas.nav.gov.hu/OSA/3.0/api"
_NS_COMMON = "http://schemas.nav.gov.hu/NTCA/1.0/common"
_NS_BASE = "http://schemas.nav.gov.hu/OSA/3.0/base"

_MAX_RETRIES = 2
_RETRY_DELAYS = (0.5, 1.5)
_RETRYABLE_STATUS = {500, 502, 503, 504}


def _get_query_url() -> str:
    return f"{settings.nav_api_url}/queryTaxpayer"


def _sha512(value: str) -> str:
    return hashlib.sha512(value.encode("utf-8")).hexdigest().upper()


def _sha3_512(value: str) -> str:
    return hashlib.sha3_512(value.encode("utf-8")).hexdigest().upper()


def _generate_request_id() -> str:
    return f"CVZ{uuid.uuid4().hex[:27].upper()}"


def _build_request_signature(request_id: str, timestamp: str) -> str:
    """requestSignature = SHA3-512(requestId + timestamp + signatureKey)"""
    ts_compact = timestamp.replace("-", "").replace(":", "").replace("T", "").replace("Z", "")
    raw = request_id + ts_compact + settings.nav_signature_key
    return _sha3_512(raw)


def _build_query_taxpayer_xml(adoszam: str) -> str:
    """Build the XML body for queryTaxpayer."""
    request_id = _generate_request_id()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    password_hash = _sha512(settings.nav_password)
    request_signature = _build_request_signature(request_id, timestamp)

    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<QueryTaxpayerRequest xmlns="{_NS_API}" xmlns:common="{_NS_COMMON}">'
        "<common:header>"
        f"<common:requestId>{request_id}</common:requestId>"
        f"<common:timestamp>{timestamp}</common:timestamp>"
        "<common:requestVersion>3.0</common:requestVersion>"
        "<common:headerVersion>1.0</common:headerVersion>"
        "</common:header>"
        "<common:user>"
        f"<common:login>{settings.nav_login}</common:login>"
        f'<common:passwordHash cryptoType="SHA-512">{password_hash}</common:passwordHash>'
        f"<common:taxNumber>{settings.nav_tax_number}</common:taxNumber>"
        f'<common:requestSignature cryptoType="SHA3-512">{request_signature}</common:requestSignature>'
        "</common:user>"
        "<software>"
        f"<softwareId>{settings.nav_software_id}</softwareId>"
        "<softwareName>Cegverzum</softwareName>"
        "<softwareOperation>LOCAL_SOFTWARE</softwareOperation>"
        "<softwareMainVersion>1.0</softwareMainVersion>"
        "<softwareDevName>Cegverzum</softwareDevName>"
        "<softwareDevContact>info@cegverzum.hu</softwareDevContact>"
        "<softwareDevCountryCode>HU</softwareDevCountryCode>"
        f"<softwareDevTaxNumber>{settings.nav_tax_number}</softwareDevTaxNumber>"
        "</software>"
        f"<taxNumber>{adoszam}</taxNumber>"
        "</QueryTaxpayerRequest>"
    )


def _parse_address(addr_el: ET.Element) -> dict | None:
    """Parse a DetailedAddress or SimpleAddress element."""
    if addr_el is None:
        return None

    result: dict = {}
    for tag in (
        "countryCode", "region", "postalCode", "city",
        "streetName", "publicPlaceCategory", "number",
        "building", "staircase", "floor", "door",
        "additionalAddressDetail",
    ):
        for ns in (_NS_BASE, _NS_API):
            el = addr_el.find(f"{{{ns}}}{tag}")
            if el is not None and el.text:
                result[tag] = el.text.strip()
                break

    return result if result else None


def _format_address(addr: dict | None) -> str | None:
    """Format a parsed address dict into a Hungarian address string."""
    if not addr:
        return None

    parts = []
    if addr.get("postalCode"):
        parts.append(addr["postalCode"])
    if addr.get("city"):
        parts.append(addr["city"])

    street_parts = []
    if addr.get("streetName"):
        street_parts.append(addr["streetName"])
    if addr.get("publicPlaceCategory"):
        street_parts.append(addr["publicPlaceCategory"])
    if addr.get("number"):
        street_parts.append(addr["number"])
    if street_parts:
        parts.append(" ".join(street_parts))

    return ", ".join(parts) if parts else None


def _find_text(root: ET.Element, tag: str, namespaces: tuple[str, ...] = (_NS_API, _NS_COMMON, _NS_BASE)) -> str | None:
    """Find first matching element text across multiple namespaces."""
    for ns in namespaces:
        el = root.find(f".//{{{ns}}}{tag}")
        if el is not None and el.text:
            return el.text.strip()
    return None


def _parse_query_taxpayer_response(xml_text: str) -> dict:
    """Parse queryTaxpayer XML response into a dict."""
    root = ET.fromstring(xml_text)

    result: dict = {
        "success": False,
        "funcCode": None,
        "errorCode": None,
        "message": None,
        "taxpayerName": None,
        "taxpayerShortName": None,
        "taxNumberDetail": None,
        "taxpayerAddress": None,
        "taxpayerAddressFormatted": None,
        "incorporation": None,
        "vatGroupMembership": None,
        "taxpayerValidity": None,
    }

    result["funcCode"] = _find_text(root, "funcCode")
    result["errorCode"] = _find_text(root, "errorCode")
    result["message"] = _find_text(root, "message")

    if result["funcCode"] != "OK":
        return result

    result["success"] = True
    result["taxpayerName"] = _find_text(root, "taxpayerName")
    result["taxpayerShortName"] = _find_text(root, "taxpayerShortName")

    # taxNumberDetail
    tn_detail = {}
    for tag in ("taxpayerId", "vatCode", "countyCode"):
        val = _find_text(root, tag)
        if val:
            tn_detail[tag] = val
    if tn_detail:
        result["taxNumberDetail"] = tn_detail

    result["incorporation"] = _find_text(root, "incorporation")
    result["vatGroupMembership"] = _find_text(root, "vatGroupMembership")

    # taxpayerValidity
    validity = {}
    for tag in ("taxpayerValidityStartDate", "taxpayerValidityEndDate", "lastUpdateTimestamp"):
        val = _find_text(root, tag)
        if val:
            validity[tag] = val
    if validity:
        result["taxpayerValidity"] = validity

    # Address
    for ns in (_NS_API, _NS_BASE):
        addr_list = root.find(f".//{{{ns}}}taxpayerAddressList")
        if addr_list is not None:
            for a_ns in (_NS_API, _NS_BASE):
                addr_item = addr_list.find(f".//{{{a_ns}}}taxpayerAddressItem")
                if addr_item is not None:
                    for inner_ns in (_NS_API, _NS_BASE):
                        addr_el = addr_item.find(f".//{{{inner_ns}}}taxpayerAddress")
                        if addr_el is not None:
                            parsed = _parse_address(addr_el)
                            result["taxpayerAddress"] = parsed
                            result["taxpayerAddressFormatted"] = _format_address(parsed)
                            break
                    break
            break

    return result


def _send_request(xml_body: str) -> httpx.Response:
    """Send request to NAV with automatic retry on transient failures."""
    last_exc: Exception | None = None
    url = _get_query_url()

    for attempt in range(_MAX_RETRIES + 1):
        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(
                    url,
                    content=xml_body,
                    headers={"Content-Type": "application/xml", "Accept": "application/xml"},
                )

            if response.status_code not in _RETRYABLE_STATUS or attempt == _MAX_RETRIES:
                return response

            logger.warning("NAV API %d – retry %d/%d", response.status_code, attempt + 1, _MAX_RETRIES)

        except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
            last_exc = exc
            if attempt == _MAX_RETRIES:
                raise
            logger.warning("NAV API hálózati hiba – retry %d/%d: %s", attempt + 1, _MAX_RETRIES, exc)

        time.sleep(_RETRY_DELAYS[min(attempt, len(_RETRY_DELAYS) - 1)])

    raise last_exc or httpx.ConnectError("NAV API nem elérhető")


def query_taxpayer(adoszam: str) -> dict:
    """Query NAV for taxpayer data by adószám (8-digit tax ID).

    Returns a dict with taxpayer data or error information.
    Raises httpx.HTTPError on connection/network errors after retries.
    """
    clean = adoszam.strip().replace("-", "").replace(" ", "")
    if not clean[:8].isdigit() or len(clean) < 8:
        return {"success": False, "funcCode": "ERROR", "message": "Érvénytelen adószám (8 számjegy szükséges)"}
    tax_id = clean[:8]

    xml_body = _build_query_taxpayer_xml(tax_id)
    response = _send_request(xml_body)

    if response.status_code != 200:
        return {
            "success": False,
            "funcCode": "ERROR",
            "message": f"NAV API HTTP {response.status_code}",
        }

    return _parse_query_taxpayer_response(response.text)
