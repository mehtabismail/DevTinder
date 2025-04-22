## DEV TINDER API's

## auth Router

- POST /signnup
- POST /login
- POST /logout

## profle Router

- GET /profile/view
- GET /profile/edit
- GET /profile/password

## connectionRequest Router

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## user Router

- GET /user/connections
- GET /user/requeests
- GET /user/feed => ( get you the profile of other users on platform )
