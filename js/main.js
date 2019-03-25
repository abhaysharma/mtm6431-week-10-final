$(document).ready(function ($) {
  // console.log('IMIN');
  const client = ShopifyBuy.buildClient({
    domain: 'cozy-furnitures.myshopify.com',
    storefrontAccessToken: '0e629a7bb9e2758f8231182f28fd4a31'
  });
  // DOM Elements
  const totalDiv = $('#total');
  const cartDiv = $('#cart');

  // Create an empty checkout
  client.checkout.create().then((checkout) => {
    // console.log(checkout)

    // Save the checout id
    const checkoutId = checkout.id;

    // Update the checkout button with the webUrl
    $('#checkoutBtn').attr('href', checkout.webUrl);
    // Update the total div with the total price from cart
    totalDiv.text('Total: ' + checkout.subtotalPrice);

    // Fetch all products in your shop
    client.product.fetchAll().then((products) => {
      // console.log(products);
      // Loop ober the products and create a card to be displayed
      $.each(products, function (key, product) {
        // console.log(product);
        let title = product.title;
        let description = product.description;
        // Get the product variant id this will be used to add the products to cart
        let productVarId = product.variants[0].id;
        let image = product.images[0].src;
        let prod = `<div class="col-sm-6 mb-4"><div class="card">
                  <img src="${image}" class="card-img-top" alt="...">
                  <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${description}</p>
                    <button class="addCart btn btn-primary" data-prodid="${productVarId}">Add to Cart</button>
                  </div>
                </div></div>`;
        // Add products to the products div
        $('#products').append(prod);
      }); // Closing products loop
    }); // Closing Fetch all products

    // Add click event to the add card button
    $('#products').on('click', '.addCart', function (e) {
      // get the product id from the data attribute of the button
      let prodId = $(this).attr('data-prodid');
      // create the array with product information to be added to the cart
      const lineItemsToAdd = [
        {
          variantId: prodId,
          quantity: 1
        }
      ];

      // Add an item to the checkout
      client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
        // Update the cart with new checkout information
        updateCart(checkout);
      }); // Closing Add items to the checkout
    }); // Closing Add Cart button click

    // Add click event to the delete product link for removing the product from cart
    $('#cart').on('click', '.delProd', function (e) {
      let itemToRemove = $(this).attr('data-lineItemId');
      const lineItemIdsToRemove = [
        itemToRemove
      ];
      // Remove an item from the checkout
      client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
        // Update the cart with new checkout information
        updateCart(checkout);
      }); // Closing Remove line items from checkout
    }); // Closing On click Delete Products
  }); // Closing Create Checkout

  // Function to update the cart on Adding or removing an item, required attribute: the checkout object
  function updateCart (checkout) {
    // Update the total price based on new checkout object
    totalDiv.text('Total: ' + checkout.subtotalPrice);
    // Get the items in the cart from the lineItems property
    let cartItems = checkout.lineItems;
    // Create a variable to contain the list of products in the cart
    let prodList = '<ul class="list-group list-group-flush">';
    // loop over the line items in the cart
    cartItems.forEach(function (item) {
      prodList += `<li class="list-group-item">
      ${item.title} x ${item.quantity}
      <a href="javascript:void(0)" class="delProd text-danger" data-lineItemId="${item.id}">
      Delete
      </a></li>`;
    }); // Closing line items loop
    prodList += '<ul>';
    // Add products list to the card div
    cartDiv.html(prodList);
    // Check if the cart lineItems are empty and display a message
    if (cartItems.length === 0) {
      cartDiv.html('Your cart is empty');
    }
  } // Closing cart update function
}); // closing docuemnt ready function
