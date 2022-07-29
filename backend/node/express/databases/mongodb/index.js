let mongoose = require('mongoose');
let errors = require('./errors.js');

let productSchema = mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    product: String,
    price: Number,
    stock: Number
});

let ProductModel = mongoose.model('Product', productSchema);


class DB {
    /**
     * @typedef Product
     * @property {number} id
     * @property {string} productName
     * @property {number} price
     * @property {number} stock
     */

    /**
     * @typedef ProductUpdate
     * @property {number} id
     * @property {string?} productName
     * @property {number?} price
     * @property {number?} stock
     */

    /**
     * @description - Starts the database connection
     * @returns {Promise<void>} void
     */
    async connect(){
        await mongoose.connect('mongodb://localhost:27017/apiDirectory', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * @description starts testing database connection
     * @returns {Promise<void>} void
     */
    async testConnect(){
        await mongoose.connect('mongodb://localhost:27017/test_apiDirectory', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * @description tears down testing environment
     * @returns {Promise<void>} void
     */
    async tearDownTest(){
        await mongoose.connection.close();
    }

    /**
     * @description resets test database
     * @returns {Promise<void>} void
     */
    async resetTest(){
        (await mongoose.connection.db.listCollections().toArray()).includes('Products') && (await mongoose.connection.dropCollection('Products'));
    }

    /**
     * @description Validates new Ids
     * @param {number} id - product id
     * @param {boolean} mutation - set to true when performing updates to bypass productExists check, defaults to false
     * @returns {Promise<void>} void
     * @throws IdNotDefinedError, InvalidIdError, ProductIdExistsError
     */
    async validateId(id, mutation = false){
        if(!id){
            throw new errors.IdNotDefinedError();
        }else if(typeof id !== 'number' || id < 1){
            throw new errors.InvalidIdError();
        }else if(!mutation && (await ProductModel.find({id}).exec())[0]){
            throw new errors.ProductIdExistsError();
        }
    }

    /**
     * @description Validates Product names
     * @param {string} productName - name to validate
     * @returns {void} void
     * @throws InvalidProductNameError
     */
    validateProductName(productName){
        if(
            typeof productName !== 'string' ||
            !productName.match(/[A-Za-z0-9- ]{3, 24}/)
        ){
            throw new errors.InvalidProductNameError();
        }
    }

    /**
     * @description Validates price
     * @param {number} price - price to validate
     * @returns {void} void
     * @throws InvalidPriceError
     */
    validatePrice(price){
        if(
            typeof price !== 'number' ||
            price < .01 ||
            price > 9999
        ){
            throw new errors.InvalidPriceError();
        }
    }

    /**
     * @description Validates stock level
     * @param {number} stock - stock level to validate
     * @returns {void} void
     * @throws InvalidStockError
     */
    validateStock(stock){
        if(
            typeof stock !== 'number' ||
            stock < 0 ||
            stock > 9999
        ){
            throw new errors.InvalidStockError();
        }
    }

    /**
     * @description - gets the selected product information from the mongodb database
     * @param {number} id - the id of the selected product
     * @returns {Promise<Product>} - the selected product
     * @throws IdNotDefinedError, InvalidIdError, ProductIdExistsError
     */
    async getProduct(id){
        try{
            await this.validateId(id);
        }catch(e){
            throw e;
        }

        return (await ProductModel.find({id}).exec())[0];
    }

    /**
     * @description - gets an array of products that match or contain productName
     * @param {string} productName - the string to match against
     * @returns {Promise<Product[]>} - the list of products with matching names
     * @throws InvalidProductNameError
     */
    async getProductsByName(productName){
        try{
            this.validateProductName(productName);
        }catch(e){
            throw e;
        }

        return (await ProductModel.find({productName: new RegExp(productName, 'i')}).exec());
    }

    /**
     * @description - gets an array of products that are the specified price
     * @param {number} price - the price to match against
     * @returns {Promise<Product[]>} - array of products with matching price
     * @throws InvalidPriceError
     */
    async getProductsByPrice(price){
        try{
            this.validatePrice(price);
        }catch(e){
            throw e;
        }

        return (await ProductModel.find({price}).exec());
    }

    /**
     * @description - gets an array of products with the level of stock specified
     * @param {number} stock - the stock level to match against
     * @returns {Promise<Product[]>} - array of products with matching price
     * @throws InvalidStockError
     */
    async getProductsByStock(stock){
        try{
            this.validateStock(stock);
        }catch(e){
            throw e;
        }

        return (await ProductModel.find({stock}).exec());
    }

    /**
     * @description - Retrieves an array of every product in the database
     * @returns {Promise<Product[]>} - array of every product
     */
    async getAllProducts(){
        return (await ProductModel.find().exec());
    }

    /**
     * @description - Adds a new product to the database 
     * @param {number} id - id number of the product, must be unique
     * @param {string} productName - name of the product
     * @param {number} price - price of the product
     * @param {number} stock - stock level of the product
     * @returns {Promise<Product>} - the product added to the store
     * @throws IdNotDefinedError, ProductIdExistsError, InvalidIdError, InvalidProductNameError, InvalidPriceError, InvalidStockError
     */
    async addProduct(id, productName = '', price = 0, stock = 0){
        try{
            await this.validateId(id);
            this.validateProductName(productName);
            this.validatePrice(price);
            this.validateStock(stock);
        }catch (e){
            throw e;
        }

        let Product = new ProductModel({
            id,
            productName,
            price,
            stock
        });

        await Product.save();
        return Product;
    }

    /**
     * @description - updates the name of a specified product
     * @param {number} id - id of the product to perform the update on
     * @param {string} productName - the new name to assign to the product
     * @returns {Promise<Product>} - the product specified post-update
     * @throws IdNotDefinedError, InvalidIdError, InvalidProductNameError, ProductIdNotExistsError
     */
    async updateProductName(id, productName = ''){
        try{
            await this.validateId(id, true);
            this.validateProductName(productName);
        }catch(e){
            throw e;
        }

        let Product = (await ProductModel.find({id}).exec())[0];

        if(!Product){
            throw new errors.ProductIdNotExistsError();
        }

        Product.productName = productName;
        
        await Product.save();

        return Product; 
    }

    /**
     * @description - updates the price of a specified product
     * @param {number} id - id of the product to perform update on 
     * @param {number} price - the new price to assign to the product
     * @returns {Promise<Product>} - The product specified post-update
     * @throws IdNotDefinedError, InvalidIdError, InvalidPriceError, ProductIdNotExistsError
     */
    async updateProductPrice(id, price = 0){
        try{
            await this.validateId(id, true);
            this.validatePrice(price);
        }catch(e){
            throw e;
        }

        let Product = (await ProductModel.find({id}).exec())[0];

        if(!Product){
            throw new errors.ProductIdNotExistsError();
        }

        Product.price = price;

        await Product.save();

        return Product;
    }

    /**
     * @description - updates the stock level of a specified product
     * @param {number} id - id of the product to perform update on 
     * @param {number} stock - the new stock level to assign to the product
     * @returns {Promise<Product>} - The product specified post-update
     * @throws IdNotDefinedError, InvalidIdError, InvalidStockError, ProductIdNotExistsError
     */
    async updateProductStock(id, stock = 0){
        try{
            await this.validateId(id, true);
            this.validateStock(stock);
        }catch(e){
            throw e;
        }

        let Product = (await ProductModel.find({id}).exec())[0];

        if(!Product){
            throw new errors.ProductIdNotExistsError();
        }

        Product.stock = stock;

        await Product.save();

        return Product;
    }

    /**
     * @description updates a product information
     * @param {number} id - id of the product to update
     * @param {string?} productName - name of the product
     * @param {number?} price - price of the product
     * @param {number?} stock - stock level of the product
     * @returns {Promise<Product>} the updated product
     * @throws IdNotDefinedError, ProductIdNotExistsError, InvalidIdError, InvalidProductNameError, InvalidPriceError, InvalidStockError
     */
    async updateProduct(id, productName = null, price = null, stock = null){
        try{
            await this.validateId(id, true);
            productName && this.validateProductName(productName);
            price && this.validatePrice(price);
            stock && this.validateStock(stock);
        }catch(e){
            throw e;
        }

        let Product = (await ProductModel.find({id}).exec())[0];

        if(!Product){
            throw new errors.ProductIdNotExistsError();
        }

        Product.productName = productName ?? Product.productName;
        Product.price = price ?? Product.price;
        Product.stock = stock ?? Product.stock;

        await Product.save();

        return Product;
    }

    /**
     * @description updates a group of products
     * @param {Array<{id: number, productName: string?, price: number?, stock: number?}>} Products - array of products to update with the updated information
     * @returns {Promise<Product[]>} an array of the updated products
     * @throws IdNotDefinedError, ProductIdNotExistsError, InvalidIdError, InvalidProductNameError, InvalidPriceError, InvalidStockError
     */
    async updateProducts(Products){
        let db = this;

        try{
            return (await Promise.all(Products.map(Product => db.updateProduct(Product.id, Product.productName, Product.price, Product.stock))));
        }catch(e){
            throw e;
        }
    }

    /**
     * @description adds multiple new products to the database
     * @param {Array<{id: number, productName: string, price: number, stock: number}>} Products - array of products to add
     * @returns {Promise<Array<Product>>} an array of the added products
     * @throws IdNotDefinedError, ProductIdExistsError, InvalidIdError, InvalidProductNameError, InvalidPriceError, InvalidStockError
     */
    async addProducts(Products){
        let db = this;

        try{
            return (await Promise.all(Products.map(Product => db.addProduct(Product.id, Product.productName, Product.price, Product.stock))));
        }catch(e){
            throw e;
        }
    }
}

module.exports = {
    DB
}