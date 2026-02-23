from pydantic import BaseModel


class NavAddress(BaseModel):
    countryCode: str | None = None
    postalCode: str | None = None
    city: str | None = None
    streetName: str | None = None
    publicPlaceCategory: str | None = None
    number: str | None = None
    building: str | None = None
    staircase: str | None = None
    floor: str | None = None
    door: str | None = None


class NavTaxNumberDetail(BaseModel):
    taxpayerId: str | None = None
    vatCode: str | None = None
    countyCode: str | None = None


class NavTaxpayerValidity(BaseModel):
    taxpayerValidityStartDate: str | None = None
    taxpayerValidityEndDate: str | None = None
    lastUpdateTimestamp: str | None = None


class NavTaxpayerResponse(BaseModel):
    success: bool
    funcCode: str | None = None
    errorCode: str | None = None
    message: str | None = None
    taxpayerName: str | None = None
    taxpayerShortName: str | None = None
    taxNumberDetail: NavTaxNumberDetail | None = None
    taxpayerAddress: NavAddress | None = None
    taxpayerAddressFormatted: str | None = None
    incorporation: str | None = None
    vatGroupMembership: str | None = None
    taxpayerValidity: NavTaxpayerValidity | None = None


class NavIntegrationStatus(BaseModel):
    name: str
    slug: str
    status: str
    message: str
    configured: bool
