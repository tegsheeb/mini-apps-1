

const App = (props) => {
  return (
    <div>
    <div> Starting checkout process. Press to continue. </div>
    <div> <Homepage/> </div>
    <div> <Form1/> </div>
    <div> <Form2/> </div>
    <div> <Form3/> </div>
    </div>
  )
};

const Homepage = ( props) => {
  return (
    <button type='button'> Checkout </button>
  )
}

const Form1 = (props) => {
  return (
    <div>
      <label>
        Name:
    <input type="text" name="name" />
      </label>
      <label>
        Email:
      <input type="text" name="email" />
      </label>
      <label>
        Password:
          <input type="text" name="password" />
      </label>
      <button type='button'> Next </button>
    </div>
  )
}

const Form2 = (props) => {
  return (
    <div>
      <div>Shipping address </div>
      <label>
        Line 1:
    <input type="text" name="line1" />
      </label>
      <label>
        Line 2:
      <input type="text" name="line2" />
      </label>
      <label>
        City:
          <input type="text" name="city" />
      </label>
      <label>
        State:
          <input type="text" name="state" />
      </label>
      <label>
       Zip code:
      <input type="text" name="zipCode" />
    </label>
    </div >
  )
}

const Form3 = (props) => {
  return (
    <div>
      <label>
       Credit card number:
    <input type="text" name="ccNumber" />
      </label>
      <label>
        Expiry data:
      <input type="text" name="expDate" />
      </label>
      <label>
        CVV:
          <input type="text" name="cvv" />
      </label>
      <label>
        Billing Zip Code:
          <input type="text" name="billingZipCode" />
      </label>
      <button type='button'> Next </button>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById('app'));
