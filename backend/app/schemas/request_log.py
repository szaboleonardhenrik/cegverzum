from datetime import datetime

from pydantic import BaseModel


class RequestLogRead(BaseModel):
    id: int
    method: str
    path: str
    status_code: int
    response_time_ms: float
    user_id: int | None = None
    ip: str | None = None
    user_agent: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class HourlyBucket(BaseModel):
    hour: str
    count: int
    error_count: int
    avg_response_time_ms: float


class TopEndpoint(BaseModel):
    path: str
    count: int
    avg_response_time_ms: float


class LogAggregateStats(BaseModel):
    total_requests: int
    requests_last_hour: int
    error_rate: float
    avg_response_time_ms: float
    top_endpoints: list[TopEndpoint]
    hourly_breakdown: list[HourlyBucket]
