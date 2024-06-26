const { init } = require('../steps/init');
const when = require('../steps/when');
const teardown = require('../steps/teardown');
const given = require('../steps/given')

describe('Given an authenticated user', () => {
	let user;

	beforeAll(async () => {
		await init();
		user = await given.an_authenticated_user();
	})

	afterAll(async () => {
		await teardown.an_authenticated_user(user);
	})

	describe('When we invoke the POST /restaurants/search endpoint with theme "cartoon"', () => {
		beforeAll(async () => {
			await init();
		});
	
		it('Returns an array of 4 restaurants', async () => {
			console.log({ user })
			const res = await when.we_invoke_search_restaurants("cartoon", user);
	
			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveLength(4);
	
			for (let restaurant of res.body) {
				expect(restaurant).toHaveProperty('name')
				expect(restaurant).toHaveProperty('image')
			}
		});
	})
})