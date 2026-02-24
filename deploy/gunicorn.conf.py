# Gunicorn config for Cégverzum API

bind = "127.0.0.1:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_tmp_dir = "/dev/shm"

# Logging
accesslog = "/var/log/cegverzum/access.log"
errorlog = "/var/log/cegverzum/error.log"
loglevel = "info"

# Timeouts
timeout = 60
graceful_timeout = 30
keepalive = 5
