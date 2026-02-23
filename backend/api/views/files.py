from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import boto3
from botocore.client import Config
import os

def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        region_name="auto",  # R2 ignores region but boto3 requires it
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"}
        ),
    )
    
class GeneratePresignedURLs(APIView):
    def post(self, request):
        file_names = request.data.get("file_names")
        directory = request.data.get("directory", "uploads")

        keys = [f"{directory}/{file_name}" for file_name in file_names]

        s3 = get_r2_client()
        # print("Client endpoint:", s3.meta.endpoint_url)
        content_types = request.data.get("content_types")

        presigned_upload_urls = []
        presigned_download_urls = []
        for i, key in enumerate(keys):
            print("Generating presigned URL for key:", key)
            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": os.getenv("R2_BUCKET_NAME"),
                    "Key": key
                },
                ExpiresIn=3600  # 1 hour
            )

            download_url = s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.getenv("R2_BUCKET_NAME"),
                    "Key": key,
                },
                ExpiresIn=3600,  # 1 hour
            )
            presigned_upload_urls.append(upload_url)
            presigned_download_urls.append(download_url)
            
        return Response({
            "upload_urls": presigned_upload_urls,
            "download_urls": presigned_download_urls
        })
    
class DeleteFilesView(APIView):
    def post(self, request):
        file_urls = request.data.get("file_urls", [])
        s3 = get_r2_client()

        objects_to_delete = []
        for url in file_urls:
            # Extract the key from the URL
            parsed_url = url.split(f"/{os.getenv('R2_BUCKET_NAME')}/")[-1].split("?")[0]
            objects_to_delete.append({"Key": parsed_url})

        if objects_to_delete:
            response = s3.delete_objects(
                Bucket=os.getenv("R2_BUCKET_NAME"),
                Delete={"Objects": objects_to_delete}
            )
            return Response({"deleted": response.get("Deleted", [])}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No files to delete."}, status=status.HTTP_400_BAD_REQUEST)
