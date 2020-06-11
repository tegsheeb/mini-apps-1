function Homepage(props) {
  return <h1>This is home page</h1>;
}

function Form1 (props) {
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
    </div>
  )
  };


function CurrentPage(props) {
  const isForm1 = props.isForm1;
  if (isForm1) {
    return <Homepage />;
  }
  return <Form1 />;
}


function CheckoutButton(props) {
  return (
    <button onClick={props.onClick}>
      checkout
    </button>
  );
}

function ReturnButton(props) {
  return (
    <button onClick={props.onClick}>
      Return
    </button>
  );
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleCheckoutClick = this.handleCheckoutClick.bind(this);
    this.handleReturnClick = this.handleReturnClick.bind(this);
    this.state = {isForm1: true};
  }

  handleCheckoutClick() {
    this.setState({isForm1: true});
  }

  handleReturnClick() {
    this.setState({isForm1: false});
  }

  render() {
    const isForm1 = this.state.isForm1;
    let button;
    if (isForm1) {
      button = <ReturnButton onClick={this.handleReturnClick} />;
    } else {
      button = <CheckoutButton onClick={this.handleCheckoutClick} />;
    }

    return (
      <div>
        <CurrentPage isForm1={isForm1} />
        {button}
      </div>
    );
  }
}


// const Form1 = (props) => {
//   return (
//     <div>
//       <label>
//         Name:
//     <input type="text" name="name" />
//       </label>
//       <label>
//         Email:
//       <input type="text" name="email" />
//       </label>
//       <label>
//         Password:
//           <input type="text" name="password" />
//       </label>
//       <button type='button'> Next </button>
//     </div>
//   )
// };

ReactDOM.render(<App/>, document.getElementById('app'));


// {/* // const Form2 = (props) =>
// //   return (
// //     <div>
// //       <div>Shipping address </div>
// //       <label>
// //         Line 1:
// //     <input type="text" name="line1" />
// //       </label>
// //       <label>
// //         Line 2:
// //       <input type="text" name="line2" />
// //       </label>
// //       <label>
// //         City:
// //           <input type="text" name="city" />
// //       </label>
// //       <label>
// //         State:
// //           <input type="text" name="state" />
// //       </label>
// //       <label>
// //        Zip code:
// //       <input type="text" name="zipCode" />
// //     </label>
// //     </div >
// //   )
// // }

// // const Form3 = (props) =>
// //   return (
// //     <div>
// //       <label>
// //        Credit card number:
// //     <input type="text" name="ccNumber" />
// //       </label>
// //       <label>
// //         Expiry data:
// //       <input type="text" name="expDate" />
// //       </label>
// //       <label>
// //         CVV:
// //           <input type="text" name="cvv" />
// //       </label>
// //       <label>
// //         Billing Zip Code:
// //           <input type="text" name="billingZipCode" />
// //       </label>
// //       <button type='button'> Next </button>
// //     </div>
// //   )
// // } */}

