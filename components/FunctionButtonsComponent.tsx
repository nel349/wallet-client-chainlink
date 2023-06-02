import React, { Component } from 'react';

type Props = {
  requestType: string;
};

type State = {
  isLoading: boolean;
};

class FunctionButtonsComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

handleClick = async () => {
    this.setState({ isLoading: true });
    try {
        const response = await fetch('http://localhost:3333/run-simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* add any data you want to send in the body */ })
        });
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
    this.setState({ isLoading: false });
};

  render() {
    console.log('MyComponent is being rendered');
    const { requestType } = this.props;
    const { isLoading } = this.state;

    // if (requestType !== 'functions-request') {
    //   return null;
    // }

    return (
      <button onClick={this.handleClick}>
        {isLoading ? 'Loading...' : 'Run Function'}
      </button>
    );
  }
}

export default FunctionButtonsComponent;