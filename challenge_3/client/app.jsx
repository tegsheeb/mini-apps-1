ReactDOM.render(<App/>, document.getElementById('app'));

function App (props) {
  return (
    <div>
    <div> Starting checkout process. Press to continue. </div>
    <div> <Homepage/> </div>
    </div>
  )

};

function Homepage ( props) {
  return (
    <button type='button'> Checkout </button>
  )
}