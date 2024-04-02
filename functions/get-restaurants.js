const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb')

const dynamodbClient = new DynamoDB()
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient)

const defaultResults = parseInt(process.env.default_results)
const tableName = process.env.restaurants_table

const getRestaurants = async (count) => {
	console.log(`fetching restaurants from ${tableName}`, { count })
	
	const resp = await dynamodb.send(new ScanCommand({
		TableName: tableName,
		Limit: count
	}))

	console.log(`found restaurants`, { count: resp.Items.length })

	return resp.Items
}

module.exports.handler = async (event, context) => {
	const restaurants = await getRestaurants(defaultResults);

	const response = {
		statusCode: 200,
		body: JSON.stringify(restaurants)
	}

	return response
}