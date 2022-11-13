const net = require('net');

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

class OrderProduct {
    constructor(product, cnt) {
        this.product = product;
        this.cnt = cnt;
    }
}

class Order {
    constructor() {
        this.products = {};
    }

    getProductsCnt() {
        let cnt = 0;
        for (const [id, orderItem] of Object.entries(this.products)) {
            cnt += orderItem.cnt;
        }
        return cnt;
    }

    addProduct(product) {
        if (this.products[product.id] instanceof OrderProduct) {
            this.products[product.id].cnt++;
        } else {
            this.products[product.id] = new OrderProduct(product, 1);
        }
        return true;
    }

    process() {
        let priceTotal = 0.0;
        for (const [id, orderItem] of Object.entries(this.products)) {
            priceTotal += orderItem.cnt * orderItem.product.price;
        }
        return {
            priceTotal: priceTotal,
            products: this.products
        }
    }
}

class Result {
    constructor(status, data = null, msg = null) {
        this.status = status;
        this.data = data;
        this.msg = msg;
    }
}

class Model {

    orders = {}

    products = {
        1: new Product(1, 'Tuareg 100g', 90.0),
        2: new Product(2, 'Mate IQ 100g', 95.0),
        3: new Product(3, 'Aromatizovaná káva karamel 60g', 80.0),
        4: new Product(4, 'Tchibo original 200g', 120.0)
    }

    getOrderId () {
        let id = this.orders.length ? this.orders.length : 1;
        this.orders[id] = {};
        return id;
    }

    getProduct(productId) {
        return this.products[productId];
    }

}

class OrderFunctionality {

    constructor(model) {
        this.model = model;
    }

    open () {
        let orderId = this.model.getOrderId();
        if (this.model.orders[orderId] instanceof Order) {
            return new Result(false, {orderId: orderId}, "Can't open already opened order.");
        }
        this.model.orders[orderId] = new Order();
        return new Result(true, {orderId: orderId}, "Order successfully opened.");
    }

    add (orderId, productId) {
        if (!this.model.orders[orderId] || !(this.model.orders[orderId] instanceof Order)) {
            return new Result(false, {orderId: null, productId: productId}, "Can't add product into not opened order.");
        }
        return new Result(
            this.model.orders[orderId].addProduct(this.model.getProduct(productId)),
            { orderId: orderId, productId: productId },
            "Product successfully added into order."
        );
    }

    process (orderId) {
        if ( !(this.model.orders[orderId] instanceof Order) || this.model.orders[orderId].getProductsCnt() < 1 ) {
            return new Result(false, {order: null}, "Can't process not opened or empty order.");
        }
        let processedOrder = this.model.orders[orderId].process();
        delete this.model.orders[orderId];
        return new Result(
            true,
            {
                order: {
                    orderId: orderId,
                    priceTotal: processedOrder.priceTotal,
                    products: processedOrder.products
                }
            },
            "Order successfully processed."
        );
    }

}

let model = new Model();
let orderFunctionality = new OrderFunctionality(model);

const server = net.createServer((c) => {

    console.log('Socket opened');

    c.setEncoding('utf8');

    c.on('end', () => {
        console.log('Socket closed');
    });

    c.on('data', (data) => {

        console.log(data);

        data = data.toString().trim();

        if (!data) {
            return;
        }

        try {
            data = JSON.parse(data);
        } catch (e) {
            c.write(
                JSON.stringify(new Result(false, null, "Invalid format."))
            );
        }

        if (typeof data != "object") {
            return;
        }

        if (data.action === "open") {
            c.write(
                JSON.stringify(orderFunctionality.open())
            );
        }

        if (data.action === "add") {
            c.write(
                JSON.stringify(orderFunctionality.add(data.data.orderId, data.data.productId))
            );
        }

        if (data.action === "process") {
            c.write(
                JSON.stringify(orderFunctionality.process(data.data.orderId))
            );
        }

        console.log(orderFunctionality.model.orders);

    });

});

// Start server on port 3000
server.listen(3000, () => {
    console.log('Server started');
});