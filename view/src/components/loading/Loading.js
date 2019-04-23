import React, { Component } from 'react'

import './Loading.css'

class Loading extends Component {

  render() {
    return <div class="loading">
      <div class="fa-3x">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
    </div>
  }

}

export default Loading
