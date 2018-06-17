const mysql = require('mysql');
const inquirer = require('inquirer');
const boxen = require('boxen');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;

    resetTables();
    welcome();
});

function bamazon() {
    console.clear();
    console.log(boxen('  ʙ  ᴀ  ᴍ  ᴀ  ᴢ  ᴏ  ɴ  ', {
        padding: 0,
        margin: 2,
        borderStyle: 'double',
        borderColor: 'cyan',
        align: 'center',
        float: 'center',
        dimBorder: true
    }));
}

function bmzn() {
    console.clear();
    console.log(boxen('  ʙ ᴍ ᴢ ɴ  ', {
        padding: 0,
        margin: 2,
        borderStyle: 'double',
        borderColor: 'cyan',
        align: 'center',
        float: 'center',
        dimBorder: true
    }));
}

function welcome() {
    bamazon();

    inquirer.prompt([
        {
            type: 'list',
            message: 'Welcome to Bamazon™! \n\nWhat would you like to do? \n',
            name: 'landing',
            choices: ["Start Shopping", "Contact Us"]
        }
    ]).then(function (response) {
        if (response.landing === "Start Shopping") {
            goShop();
        } else {
            contactSupp();
        };
    });
};

function contactSupp() {
    bmzn();

    inquirer.prompt([
        {
            type: 'list',
            message: 'Contact Us \n\nFor any inquiries, concerns, and/or feedback, feel free to contact us using our toll-free number at +1 (800) 555-5555. \n\nThank you for choosing Bamazon™ as we look forward to hearing from you soon! \n',
            name: 'support',
            choices: ["Go back"]
        }
    ]).then(function (response) {
        if (response.support === "Go back") {
            welcome();
        };
    });
}

function goShop() {
    bmzn();

    console.log("Items that are currently in stock: \n");

    connection.query(
        "SELECT * FROM products WHERE stock_quantity > 0", function (err, res) {
            if (err) throw err;

            for (var i = 0; i < res.length; i++) {
                console.log(`Book ID: ${res[i].item_id} \nTitle: "${res[i].book_name}" \nDepartment: ${res[i].department_name} \nPrice: $${res[i].price_USD} \nAvailability: ${res[i].stock_quantity} ct. \n`);
            };

            inputItems();
        }
    );
}

function inputItems() {
    inquirer.prompt([
        {
            type: 'input',
            message: "Enter a 'Book ID' to add to your shopping cart: ",
            name: 'inputid',
            validate: function validateInput(name) {
                return name !== '';
            }
        },
        {
            type: 'input',
            message: 'Quantity desired: ',
            name: 'inputq',
            validate: function validateInput(name) {
                return name !== '';
            }
        }
    ]).then(function (response) {
        var selectedId = parseInt(response.inputid);
        var selectedAmt = parseInt(response.inputq);

        addingToCart(selectedId, selectedAmt);
    });
}

function addingToCart(selectedId, selectedAmt) {
    connection.query(
        `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
            var newInv = parseInt(res[0].stock_quantity) - selectedAmt;

            if (err) throw err;

            if (newInv >= 0) {
                connection.query(
                    `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
                        if (err) throw err;

                        for (var i = 0; i < res.length; i++) {
                            if (selectedId === parseInt(res[i].item_id)) {
                                connection.query(
                                    "INSERT INTO cart SET ?", {
                                        "item_id": res[i].item_id,
                                        "book_name": res[i].book_name,
                                        "department_name": res[i].department_name
                                    }, function (err, res) {
                                        if (err) throw err;
                                    }
                                );
                            } // NEED AN ELSE FOR INVALID ID INPUTS Q_Q
                        };
                    }
                );

                connection.query(
                    "UPDATE products SET ? WHERE ?", [
                        {
                            "stock_quantity": newInv
                        },
                        {
                            "item_id": selectedId
                        }
                    ], function (err, res) {
                        if (err) throw err;
                    }
                );

                connection.query(
                    `SELECT * FROM products WHERE item_id = ${selectedId}`, function (err, res) {
                        if (err) throw err;

                        /* FIX THE MATH HERE*/
                        var calcAmt = parseFloat(res[0].price_USD) * selectedAmt;
                        var adjAmt = calcAmt.toFixed(2);

                        connection.query(
                            "UPDATE cart SET ? WHERE ?", [
                                {
                                    "price_USD": adjAmt
                                },
                                {
                                    "item_id": selectedId
                                }
                            ], function (err, res) {
                                if (err) throw err;
                            }
                        );

                        connection.query(
                            "UPDATE cart SET ? WHERE ?", [
                                {
                                    "quantity": adjAmt
                                },
                                {
                                    "item_id": selectedId
                                }
                            ], function (err, res) {
                                if (err) throw err;

                                shopOptions();
                            }
                        );
                    }
                );
            } else {
                reviseEntry();
            };
        }
    );
}

function shopOptions() {
    inquirer.prompt([
        {
            type: 'list',
            message: '\n\nItem(s) have been added to your shopping cart. What would you like to do? \n',
            name: 'options',
            choices: ["Keep shopping", "Go to cart"]
        }
    ]).then(function (response) {
        if (response.options === "Keep shopping") {
            goShop();
        } else {
            goToCart();
        };
    });
}

function reviseEntry() {
    inquirer.prompt([
        {
            type: 'list',
            message: "\n\nThe amount you've entered exceeds the stock availability of the product! Please revise your entries. \n",
            name: 'backtolist',
            choices: ["Back to products"]
        }
    ]).then(function (response) {
        if (response.backtolist === "Back to products") {
            goShop();
        }
    });
}

function goToCart() {
    connection.query(
        "SELECT * FROM cart", function (err, res) {
            if (err) throw err;

            bmzn();

            console.log("\nYour shopping cart: ");

            for (var i = 0; i < res.length; i++) {
                /* FIX THE MATH HERE*/
                var qCost = parseFloat(res[i].price_USD) * parseInt(res[i].quantity);
                var adjCost = qCost.toFixed(2);

                console.log(`\nBook ID: ${res[i].item_id} \nTitle: ${res[i].book_name} \nSeries: ${res[i].department_name} \nPrice: $${adjCost} \nQuantity: ${res[i].quantity} \n`);
            };
        }
    );
}

function editCart() {

}


function checkOut() {

}

function resetTables() {
    connection.query(
        "UPDATE products SET stock_quantity = 30 WHERE item_id = 1010",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 20 WHERE item_id = 1011",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 20 WHERE item_id = 1012",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2021",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2022",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2023",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2024",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 100 WHERE item_id = 2025",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3032",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3033",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3034",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "UPDATE products SET stock_quantity = 50 WHERE item_id = 3035",
        function (err, res) {
            if (err) throw err;
        }
    );
    connection.query(
        "TRUNCATE TABLE cart",
        function (err, res) {
            if (err) throw err;
        }
    );
}