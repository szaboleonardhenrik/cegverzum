from pydantic import BaseModel


class ModuleRead(BaseModel):
    id: int
    slug: str
    display_name: str
    description: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class UserModuleRead(BaseModel):
    id: int
    user_id: int
    module_id: int
    module_slug: str
    module_name: str
    is_active: bool

    model_config = {"from_attributes": True}
