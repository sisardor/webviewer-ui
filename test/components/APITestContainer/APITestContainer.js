import React from 'react';

import apis from '../../apis';

class APITests extends React.Component {

  render() {
    return(
      <React.Fragment>
        {
          Object.keys(apis).map(key => {
            return key.indexOf('divider') === 0 ?
            <hr />
          : <button onClick={apis[key]}>{key}</button>;
          })
        }
      </React.Fragment>
    );
  }
}

export default APITests;