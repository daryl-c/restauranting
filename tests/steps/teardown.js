const { 
	CognitoIdentityProviderClient,
	AdminDeleteUserCommand
} = require('@aws-sdk/client-cognito-identity-provider')

const an_authenticated_user = async (user) => {
	const cognito = new CognitoIdentityProviderClient()

	const userpoolId = process.env.cognito_user_pool_id

	const req = new AdminDeleteUserCommand({
		UserPoolId: userpoolId,
		Username: user.username
	})
	await cognito.send(req)

	console.log(`[${user.username}] - user is deleted`)
}

module.exports = {
	an_authenticated_user
}