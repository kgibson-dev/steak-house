import { menuArray } from "./data.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// Defind the elements we need to use later on
const checkout = document.getElementById('checkout')
const checkoutItemsContainer = document.getElementById('checkout-items-container')
const checkoutTotalPrice = document.getElementById('checkout-total-price')
const paymentModal = document.getElementById('payment-modal')
const successModal = document.getElementById('success-modal')



// This function filters the menuArray  using .filter and for each array 
// item which equals the food catgory passed in as a funciton parameter
// it returns the HTML with the required data for that food item
let menuCategoryHtml =``
function filterCategory(category){
    menuCategoryHtml = ``
    const categoryFilter = menuArray.filter(item => item.category === category)
    categoryFilter.forEach(function(item){
        menuCategoryHtml += `
        <div class="menu-item-container">
            <div class="item-image-container">
                <img class="item-image" src="${item.image}">
            </div>
            <div class="item-descrption-container">
                <p>${item.name}</p>
                <p class="item-ingredients">${item.ingredients}</p>
                <p class="item-price">£${item.price}</p>
            </div>
            <div class="item-add-minus-icons-container">
                <div class="minus-btn hidden"  id='minus-btn-${item.id}'>
                    <i class="fa-solid fa-minus item-add-minus-icons" data-minusitem="${item.id}"></i>
                </div>
                <div class="add-btn">
                    <i class="fa-solid fa-plus item-add-minus-icons" data-additem="${item.id}"></i>
                </div>
            </div>
        </div>
        `
    })
    return menuCategoryHtml
}

// This function renders the menu html for each food item and places it in the correct category on the site
function renderMenuItems(){
    const catagories = ['steaks', 'sides', 'drinks']
    catagories.forEach(function(category){
        document.getElementById(`item-category-${category}`).innerHTML = filterCategory(category)
    })
    
}

renderMenuItems()


document.addEventListener("click", function(e){
    if(e.target.dataset.additem){
        handleAddItemClick(e.target.dataset.additem)
    } else if(e.target.dataset.minusitem){
        handleMinusItemClick(e.target.dataset.minusitem)
    } else if(e.target.dataset.itemid){
        handleRemoveItemClick(e.target.id, e.target.dataset.itemid) 
    } else if (e.target.id === "checkout-btn") {
        handleCompleteOrderClick()
    } else if(e.target.id === "succes-modal-btn") {
        handleContinueClick()
    } 
})



let currentOrder = []

// When a click event happens on the Add button the following funciton is run.
function handleAddItemClick(itemId){
    // Check if the current order is empty.  If it is then unhide the checkout section
    // and add the item to the current order
    if(!currentOrder.length) {
		checkout.classList.toggle("hidden")
		document
			.querySelector(`#minus-btn-${itemId}`)
			.classList.toggle("hidden")
		currentOrder.push({
			id: itemId,
			name: menuArray[itemId].name,
			price: menuArray[itemId].price,
			count: 1,
		})

		// Check if the current order does not contain the item being added and if not then
		// add the item to the current order
	} else if (currentOrder.findIndex(item => item.id === itemId) < 0) {
		currentOrder.push({
			id: itemId,
			name: menuArray[itemId].name,
			price: menuArray[itemId].price,
			count: 1,
		})
		// Unhide the minus button for future use so that the user can remove the item if needed
        document
			.querySelector(`#minus-btn-${itemId}`)
			.classList.toggle("hidden")

    // Check if the current order does contain the item being added then
    // increment the number of items in the order
	} else {
        currentOrder[(currentOrder.findIndex(item => item.id === itemId))].count += 1
    }
   renderOrder(currentOrder)
}
    

// This function handles clicks of the minus icon
function handleMinusItemClick(itemId){
    // FInd the current item in the current order by its ID
    const orderedItem = currentOrder[(currentOrder.findIndex(item => item.id === itemId))]
    // If the item has more than 0 number of items in the current order then decrease the amount by 1
    if(orderedItem.count > 0) {
        orderedItem.count -= 1
        
        // If clickng the button means that the number of items is zero then remove that item from the order completely
        // and hide the minus button from the menu item
        if (orderedItem.count === 0){
            currentOrder.splice(currentOrder.findIndex(item => item.id === itemId),1)
            document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden")
        }
    }
    renderOrder(currentOrder)
    }



let totalPrice = 0        

// Function to render the current order to the checkout part of the wesbite.
function renderOrder(currentOrder){
    checkoutItemsContainer.innerHTML = `<div class="checkout-title">Your Order</div>`
    checkoutTotalPrice.innerHTML = ``
    totalPrice = 0 

    // For each item in the current order append the html to the container
    currentOrder.forEach(function(item){
        checkoutItemsContainer.innerHTML += `
        <div class="checkout-item">
            <div class="checkout-item-name">${item.name} x ${item.count}
            <span class="checkout-item-remove" id="checkout-item-remove-${uuidv4()}" data-itemid="${item.id}">remove</span></div>
            <div class="checkout-item-price">£${item.price * item.count}</div>
        </div>
        `
        // Increase the total price x the number of items added
        totalPrice += item.price * item.count
    
    })

    // If the total price is zero, hide the checkout and set current order to empty
    if(totalPrice === 0){
         checkout.classList.toggle("hidden")
         currentOrder = []
     } else {  // Otherwise create the HTML for the checkout total price container
         checkoutTotalPrice.innerHTML = `
        <p>Total Price: </p>
        <div>£${totalPrice}</div>
        `
        document.getElementById('checkout-btn').innerHTML = `
        <div>
            <button class="all-btn all-btn-text" id="checkout-btn">Complete Order</button>
        </div>
        `
     }
}


// Function to remove item completely from the current order regardless of how many have been ordered.
function handleRemoveItemClick(itemUuid, itemId){
    // Remove the grandparent container element to remove the ordered item 
    document.getElementById(itemUuid).parentElement.parentElement.remove()
    const item = currentOrder.findIndex(item => item.id === itemId)
    
    // Decrease the total price and remove the item from the current order
    totalPrice -= currentOrder[item].price * currentOrder[item].count
    currentOrder.splice(item,1)
    checkoutTotalPrice.textContent = totalPrice

    // hide the minus button for the item which has been removed from the order
    document.querySelector(`#minus-btn-${itemId}`).classList.toggle("hidden")
    
    // Add new total price to the HTML
    checkoutTotalPrice.innerHTML = `
        <p>Total Price: </p>
        <div>£${totalPrice}</div>
        `
        // If total price is zero then hide the checkout and empty the current order
        if(totalPrice === 0){
        checkout.classList.toggle("hidden")
        currentOrder = []
    }
}


// Function to complete the order and move to the payment modal
function handleCompleteOrderClick() {
    // Show the payment modal and create the HTML content
    paymentModal.style.display="flex"
    paymentModal.innerHTML = `
    <div class="payment-modal-content">
        <h1 class="payment-title" >Please enter your card details</h1>
        
        <form class="payment-form" id="payment-form">
            <input class="payment-input" type="text" id="payment-name" placeholder="Enter your name" required>
            <input class="payment-input" id="cc-input" type="tel" placeholder="Enter card number" required minlength="16" maxlength="16" pattern="[0-9]*">
            <input class="payment-input" type="tel" placeholder="Enter CVV" required minlength="3" maxlength="3" pattern="[0-9]*">
            <div class="payment-icons-container">
                <i class="fa-brands fa-cc-visa payment-icons"></i>
                <i class="fa-brands fa-cc-mastercard payment-icons"></i>
            </div>
            <button class="all-btn all-btn-text">Pay</button>
        </form>
    </div>
    `


    const paymentForm = document.getElementById('payment-form')

    // Set a Submit eventlistener for the submit button in the payment form
    paymentForm.addEventListener('submit', function(e){
        // Stop it carrying out the default action of a submit button
        e.preventDefault()
        
        // Extract the name of the user from the name input field int he payment form
        const paymentFormData = new FormData(paymentForm)
        paymentFormData.append("text", document.getElementById("payment-name").value)
        paymentModal.style.display="none"
        
        // Call the renderSuccess function and pass in the name of the user.
        renderSuccess(paymentFormData.get('text'))
    })
}

// Function to render the succes modal and prompt for a review
function renderSuccess(name){
	// Show the success modal and create the HTML content
	successModal.style.display = "flex"
	successModal.innerHTML = `
    <div class="success-modal-content">
        <p class="success-thanks-text">Thanks, ${name}! 😊</p>
        <p class="success-order-text">Your payment was successful and your order is on it's way!</p>
        <div class="success-rating-container">
            <p class="success-order-text">How did we do today?</p>
            <div class="success-rating-icons">
                <input type="radio" name="rating" value="5" id="5"><label for="5">☆</label>
                <input type="radio" name="rating" value="4" id="4"><label for="4">☆</label>
                <input type="radio" name="rating" value="3" id="3"><label for="3">☆</label>
                <input type="radio" name="rating" value="2" id="2"><label for="2">☆</label>
                <input type="radio" name="rating" value="1" id="1"><label for="1">☆</label>
            </div>
        </div>
        <button class="all-btn all-btn-text" id="succes-modal-btn">Continue</button>
    </div>
    `
}

// Function to return the user to the menu after completing the review
function handleContinueClick(){
    // Hide the success modal
    successModal.style.display = "none"
    // Hide the checkout section
    checkout.classList.toggle("hidden")
    // Empty the current order
    currentOrder = []
    // Render the menu items to remove any left over things from the previous order.
    renderMenuItems()
}
