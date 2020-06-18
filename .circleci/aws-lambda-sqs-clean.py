#!/usr/bin/env python3

import pdb
import boto3

# First initialize the client
client = boto3.client('sqs')


def is_removable(queue_url) -> bool:
    """
    Returns True if the queue url does not end with staging or production
    :param str queue_url: The queue url
    :return bool:
    """
    if str(queue_url).endswith("staging") == True \
        or str(queue_url).endswith("production") == True:
        return False
    return True


def get_queue_list() -> [str]:
    """
    Returns an array of strings containing a list of queue urls
    :return Array[str]:
    """
    # We need to get a list of all of our queues
    response = client.list_queues(
        QueueNamePrefix="atd-vz-data-events-"
    )
    # Return our list
    return response.get("QueueUrls", [])


def get_queue_name_from_url(queue_url) -> str:
    """
    Returns a string with the name of the queue
    :param str queue_url:
    :return str:
    """
    return queue_url[41:]


def get_function_name_from_url(queue_url) -> str:
    """
    Returns a string with the name of the lambda function
    :param str queue_url:
    :return str:
    """
    return queue_url[41:]


def delete_queue(queue_url) -> dict:
    """
    Returns a dictionary with the deletion response
    :param str queue_url:
    :return dict:
    """
    return client.delete_queue(
        QueueUrl=queue_url
    )


#
# Main Function
#
def main():
    queues = get_queue_list()

    for queue_url in queues:
        removable = is_removable(queue_url)
        queue_name = get_queue_name_from_url(queue_url)
        function_name = get_function_name_from_url(queue_url)
        if removable:
            print(f"Removing: {removable} : {queue_name} : {function_name}")
            print(delete_queue(queue_url))
        else:
            print(f"Skipping: {removable} : {queue_name} : {function_name}")


if __name__ == "__main__":
    main()
    print("Done")
