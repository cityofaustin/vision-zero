import logging
import sys


def get_logger(name, level):
    """Return a module logger that streams to stdout"""
    logger = logging.getLogger(name)
    formatter = logging.Formatter(fmt="%(asctime)s %(levelname)s: %(message)s")
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(level)
    return logger
