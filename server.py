import os
import re
import base64
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
origins = [os.getenv("ALLOWED_ORIGIN", "*")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email: str
    chartImage: str

@app.post("/send-email")
@limiter.limit("100/15minutes")
async def send_email(request: Request, body: EmailRequest):
    """
    Handles sending an email with a chart image attachment.
    Args:
        request (Request): The incoming HTTP request object.
        body (EmailRequest): The request body containing the recipient's email address and the chart image in base64 format.
    Raises:
        HTTPException: If required fields are missing, the email address is invalid, the chart image format is invalid, or if sending the email fails.
    Returns:
        JSONResponse: A response indicating whether the email was sent successfully.
    """

    email = body.email
    chart_image = body.chartImage

    # Validate inputs
    if not email or not chart_image:
        raise HTTPException(status_code=400, detail="Email and chart image are required.")

    # Validate email format
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    # Validate chart image format
    if not chart_image.startswith("data:image/png;base64,"):
        raise HTTPException(status_code=400, detail="Invalid chart image format.")

    # Prepare email
    msg = EmailMessage()
    msg["Subject"] = "Your Chart Image"
    msg["From"] = os.getenv("FROM_EMAIL")
    msg["To"] = email
    msg.set_content("Please find your chart image attached.")
    image_data = base64.b64decode(chart_image.split(",")[1])
    msg.add_attachment(image_data, maintype="image", subtype="png", filename="chart.png")
    print("Prepared email to:", email)
    # Send email
    try:
        with smtplib.SMTP(
            os.getenv("SMTP_HOST"),
            int(os.getenv("SMTP_PORT", 587))
        ) as server:
            if os.getenv("SMTP_SECURE", "false").lower() == "true":
                server.starttls()
            server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
            server.send_message(msg)
    except Exception as e:
        print("Error sending email:", e)
        raise HTTPException(status_code=500, detail="Failed to send email.")

    return JSONResponse(content={"message": "Email sent successfully!"}, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv("PORT", 3000)), reload=True)