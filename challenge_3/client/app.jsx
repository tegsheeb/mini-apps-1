function Homepage(props) {
  return <h1>This is home page</h1>;
}

function Form1(props) {
  return (
    <form onSubmit={this.handleSubmit}>
      <label>
        Name:
        <input type='text' name='name' onChange={this.handleChange} />
      </label>
      <label>
        Email:
        <input type='text' name='email' onChange={this.handleChange} />
      </label>
      <label>
        Password:
        <input type='text' name='password' onChange={this.handleChange} />
      </label>

      <input type='submit' value='Next' />
    </form>
  )
};

function Form2 (props) {
  return (
    <form onSubmit={this.handleSubmit}>
      <div>Shipping address </div>
      <label>
        Line 1:
    <input type="text" name="line1" onChange={this.handleChange} />
      </label>
      <label>
        Line 2:
      <input type="text" name="line2" onChange={this.handleChange}/>
      </label>
      <label>
        City:
          <input type="text" name="city" onChange={this.handleChange}/>
      </label>
      <label>
        State:
          <input type="text" name="state" onChange={this.handleChange}/>
      </label>
      <label>
       Zip code:
      <input type="text" name="zipCode" onChange={this.handleChange} />
    </label>
    <input type='submit' value='Next' />

    </form >
  )
};

function Form3 (props) {
  return (
    <form onSubmit={this.handSubmit}>
      <label>
        Credit card number:
        <input type="text" name="ccNumber" onChange={this.handleChange}/>
      </label>
      <label>
        Expiry data:
        <input type="text" name="expDate" onChange={this.handleChange} />
      </label>
      <label>
        CVV:
        <input type="text" name="cvv" onChange={this.handleChange}/>
      </label>
      <label>
        Billing Zip Code:
        <input type="text" name="billingZipCode" onChange={this.handleChange} />
      </label>
      <input type='submit' value='Next' />
    </form>
  )
};


class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleHomepageToForm1 = this.handleHomepageToForm1.bind(this);
    this.handleForm1ToForm2 = this.handleForm1ToForm2.bind(this);
    this.handleForm2ToForm3 = this.handleForm2ToForm3.bind(this);

    this.state = {
      isHomepage: true,
      isForm1: false,
      isForm2: false,
      isForm3: false,
    };
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value});
  }

  handleHomepageToForm1() {
    this.setState({
      Homepage: false,
      isForm1: true
    });
  }


  handleForm1ToForm2() {
    this.setState({
      isForm1: false,
      isForm2: true
    });
  }

  handleForm2ToForm3() {
    this.setState({
      isForm2: false,
      isForm3: true
    });
  }

  render() {
    let rendering;
    if (this.state.isHomepage) {
      rendering = <button onClick={this.handleHomepageToForm1}> Let's start checkout </button>
    } else if (this.state.isForm1) {
      rendering = <Form1 onSubmit={this.handleForm1ToForm2} onChange={this.handleChange}/>
    } else if (this.state.isForm2) {
      rendering = <Form2 onSubmit={this.handleForm2ToForm3} onChange={}/>
    }

    return rendering

  }
}

ReactDOM.render(<App/>, document.getElementById('app'));