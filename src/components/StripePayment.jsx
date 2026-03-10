import React from "react";
import {loadStripe} from "@stripe/stripe-js";
import {
Elements,
CardElement,
useStripe,
useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_12345YOURKEY");

const CheckoutForm = ({onSuccess}) => {

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {

    e.preventDefault();

    if(!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    const {error,paymentMethod} = await stripe.createPaymentMethod({
      type:"card",
      card:card
    });

    if(error){
      alert(error.message);
    }else{
      onSuccess(paymentMethod.id);
    }

  };

  return(

    <form onSubmit={handleSubmit}>

      <CardElement/>

      <button type="submit" style={{marginTop:"20px"}}>
        Payer
      </button>

    </form>

  );

};

const StripePayment = ({onSuccess}) => {

  return(

    <Elements stripe={stripePromise}>

      <CheckoutForm onSuccess={onSuccess}/>

    </Elements>

  );

};

export default StripePayment;