let { DB } = require('./index.js');
let errors = require('./errors.js');

let db;

let validProducts = [
    {
        id: 1,
        productName: 'pizza',
        price: 5.99,
        stock: 55
    },
    {
        id: 2,
        productName: 'cheese',
        price: 2.99,
        stock: 115
    }
]

beforeAll(async () => {
    db = new DB();
    await db.testConnect();
});

afterEach(async () => {
    await db.resetTest();
})

afterAll(async () => {
    await db.tearDownTest();
});

describe('test validation', () => {
    it('should validate id', async () => {
        await expect(db.validateId(2)).resolves.not.toThrow();
    });

    it('should throw invalid id', async () => {
        await expect(db.validateId('k')).rejects.toThrow(errors.InvalidIdError);
    })
})

describe('adding products', () => {
    it('should add product to the database', async () => {
        let product = validProducts[0];

        let res = (await db.addProduct(product.id, product.productName, product.price, product.stock));

        expect(res).toBe(product);
    })
})