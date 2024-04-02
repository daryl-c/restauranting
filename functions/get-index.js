const fs = require("fs")
const Mustache = require('mustache')
const http = require('axios')
const aws4 = require('aws4')
const { URL } = require('url')

const restaurantsApiRoot = process.env.restaurants_api
const cognitoUserPoolId = process.env.cognito_user_pool_id
const cognitoClientId = process.env.cognito_client_id
const awsRegion = process.env.AWS_REGION

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const template = fs.readFileSync('static/index.html', 'utf-8')

const getRestaurants = async () => {
	console.log('loading restaurants from restaurantsApi', { restaurantsApiRoot})
	
	const url = new URL(restaurantsApiRoot)
	const opts = {
		host: url.hostname,
		path: url.pathname
	}
	aws4.sign(opts)

	const res = await http.get(restaurantsApiRoot, {
		headers: opts.headers
	})

	return res.data
}

module.exports.handler = async (event, context) => {
	const restaurants = await getRestaurants()
	const dayOfWeek = days[new Date().getDay()]
	const view = {
		awsRegion,
		cognitoUserPoolId,
		cognitoClientId,
		dayOfWeek,
		restaurants,
		searchUrl: `${restaurantsApiRoot}/search`
	}
	const html = Mustache.render(template, view)
	const response = {
		statusCode: 200,
		headers: {
			'content-type': 'text/html; charset=UTF-8'
		},
		body: html
	}

	return response
}