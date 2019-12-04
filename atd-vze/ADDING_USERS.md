## Logging into VZE for the 1st time

- Go to https://visionzero.austin.gov/editor/#/login
- Click "Log In". You will be redirected to login page at `atd-datatech.auth0.com/login`.
- Click "Don't remember your password"

![Screen Shot 2019-11-25 at 3 53 24 PM](https://user-images.githubusercontent.com/5697474/69582637-9fe42580-0f9e-11ea-8046-8d5e27a35447.png)

- Enter your CoA.gov email and click "Send Email". 
- You should immediately get an email from "ATD Vision Zero Editor <no-reply@auth0user.net>" with the subject "Reset your password"

<img width="1130" alt="Screen Shot 2019-11-25 at 3 53 56 PM" src="https://user-images.githubusercontent.com/5697474/69582643-a2df1600-0f9e-11ea-8b62-0204919ab82c.png">


- Click the link in the email and enter a new password and confirm with the same password. 
  - _We recommend using a generated password tool and a [password manager](https://www.cnet.com/news/best-password-managers-for-2019/) like LastPass or 1Password._


<img width="383" alt="Screen Shot 2019-11-25 at 3 59 49 PM" src="https://user-images.githubusercontent.com/5697474/69582856-1c770400-0f9f-11ea-87fb-fa398c1b1682.png">

- Once your password has successfully been reset, go back to [https://visionzero.austin.gov/editor/#/login](https://visionzero.austin.gov/editor/#/login) and click the blue "Login" button.
- Enter your CoA.gov email and your new password. This should successfully log you into VZE.

---

## (For User admins) Adding new users

- Create a new user in the ATD DTS Auth0 account (https://manage.auth0.com/dashboard/us/atd-datatech/users)
- Update the `app_metadata` for that user. For the editor role, it would look like this:

```json
{
  "roles": [
    "editor"
  ]
}
```

- Send the new user(s) the "Logging into VZE for the 1st time" instructions above.
