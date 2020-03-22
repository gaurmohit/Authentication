This is an authentication system with the following things as the main focus:
* The page takes in only 3 user inputs - Name, email, and password.
* If someone from the same IP address attempts to register more than 3 times in a day,
    they will be presented with a captcha (Google Recaptcha). The captcha will be
    validated for all subsequent attempts to register for that IP address.
* If everything in the input is fine, then the user details will be stored in a Mongo
    database.

To set up this in your system, follow the following steps:

    npm install

Initialize three env variables in your '.env' file: 

* PORT
* DB_URI
* SECRET_KEY_CAPTCHA
    

And at last execute the server with the following cmd

    npm start

To see the demo visit:
### https://auth-imagekit-assignment.herokuapp.com/ ###