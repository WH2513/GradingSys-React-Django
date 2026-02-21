from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.response import Response

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        refresh_token = data.get("refresh")
        # access_token = data.get("access")

        # Remove refresh token from JSON response
        response.data.pop("refresh", None)

        # Set HttpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,        # True in production (HTTPS)
            samesite="None",    # Required for cross-site cookies
            max_age=60 * 60 * 24 * 7,  # 7 days
        )

        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token is None:
            return Response({"detail": "Refresh token missing"}, status=400)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]

        return Response({"access": access_token})