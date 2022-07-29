class ProductIdExistsError extends Error {
    constructor(message = "Product Id Exists", ...args){
        super(message, ...args);
    }
}

class ProductIdNotExistsError extends Error {
    constructor(message = 'Product Id does not exist', ...args){
        super(message, ...args);
    }
}

class IdNotDefinedError extends Error {
    constructor(message = 'Product Id not defined', ...args){
        super(message, ...args);
    }
}

class InvalidIdError extends Error {
    constructor(message = 'Invalid Id format', ...args){
        super(message, ...args);
    }
}

class InvalidProductNameError extends Error {
    constructor(message = 'Invalid product name format', ...args){
        super(message, ...args);
    }
}

class InvalidPriceError extends Error {
    constructor(message = 'Invalid price format', ...args){
        super(message, ...args);
    }
}

class InvalidStockError extends Error {
    constructor(message = 'Invalid stock format', ...args){
        super(message, ...args);
    }
}

module.exports = {
    ProductIdExistsError,
    ProductIdNotExistsError,
    IdNotDefinedError,
    InvalidIdError,
    InvalidProductNameError,
    InvalidPriceError,
    InvalidPriceError
};