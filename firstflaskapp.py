from flask import Flask, render_template, request, redirect,session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = '30dba59fcf1f1dc67d1ca99a96aacb4f'

@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response

# or set the cache timeout for specific static files
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/set-gift')
def set_gift():
    gift = request.args.get('gift')

    if gift:
        session['gift'] = gift  # Store the gift in the session
        return redirect('/send-email')  # Redirect to the email sending route
    print("No gift value provided")
    return "No gift value provided", 400

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/thankyou')
def last():
    send_email()
    return render_template('lastpage.html')

# Replace these with your actual email credentials
EMAIL_ADDRESS = "info.sonibrosretail@gmail.com"
EMAIL_PASSWORD = "mbgqvczqdkzehaxo"
RECIPIENT_EMAIL = "prashantrandiwe@gmail.com"#sonibrosfranchise@gmail.com

@app.route('/form', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        session['name'] = request.form['name']
        session['phone'] = request.form['phone']
        session['email'] = request.form['email']
        return redirect('/playandwin')
    return render_template('form.html')

@app.route('/send-email')
def send_email():
    name = session.get('name')
    phone = session.get('phone')
    email = session.get('email')
    gift = session.get('gift', 'No gift information available')
    
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = 'New Gift Form Submission'

    body = f"""
    New form submission:

    Name: {name}
    Phone: {phone}
    Email: {email}
    gift:{gift}
    """

    msg.attach(MIMEText(body, 'plain'))

        # Send the email
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        return redirect("/thankyou")

    except Exception as e:
            print(f"Failed to send email: {e}")
            return "There was an error sending your email. Please try again later."


@app.route('/playandwin')
def thank_you():
     return render_template('spinner.html')

if __name__ == '__main__':
    app.run(debug=True)
