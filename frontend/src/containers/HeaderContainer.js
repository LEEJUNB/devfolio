import React, {Component} from 'react'
import Header from "components/Header"
import { connect } from 'react-redux'
import { bindActionCreators } from "redux"
import action from "action"

class HeaderContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLogin : localStorage.displayName ? true : false,
      isLoginButtonClicked : false,
      showMenuBg : this.props.isAlwaysShowing ? true : this.props.showMenuBg,
      userName : this.props.user.displayName,
      showSideBar : false,
      bgColorTransParent : this.props.bgColorTransParent,
      isLogout : null
      // renderHome : false
    }
  }

  online = (session) => {
    var currentTime = (new Date()).getTime() / 1000;
    return session && session.access_token && session.expires > currentTime
  }

  componentDidMount() {
    window.addEventListener('scroll', ()=>{this._handleScroll()})
  }

  _showModal = () => {
    this.setState({
      isLoginButtonClicked : true,
      isLogout : false
      // isLoginButtonClicked : !this.state.isLoginButtonClicked
    })
  }

  _onClickModalCancel = () => {
    this.setState({
      isLoginButtonClicked : !this.state.isLoginButtonClicked
    })
  }

  _handleScroll = () => {
    if(this.state.bgColorTransParent) {
      return
    }
    if (!this.state.showMenuBg && window.pageYOffset !== 0) {
      this.setState({
        showMenuBg : true
      })
    } else if (window.pageYOffset === 0) {
      if(this.props.isAlwaysShowing){
        return
      }
      this.setState({
        showMenuBg : false,
        isLoginButtonClicked : false,
      })
    }
  }
  
  _loginSuccess = (email, displayName, picture, social, space, language, follower) => {
    this.props.doLogin(email, displayName, picture, social, space, language, follower)
    this.setState({
      ...this.state,
      userName: localStorage.displayName
    })
  }
  
  //redux값이 변경되서 Props를 받을때다.
  componentWillReceiveProps(nextProps) {
    this.setState({
      isLogin: localStorage.displayName,
      userName : nextProps.user.displayName
    })
  }
  
  shouldComponentUpdate(nextProps,nextState) {
    return true
  }

  _clickNickname = (showSideBar) => {
    this.setState({
      ...this.state,
      // renderHome: false,
      showSideBar: !this.state.showSideBar
    })
  }

  _onClickLogout = () => {
    localStorage.clear()
    this.setState({
      ...this.state,
      isLogout: true,
      showSideBar: !this.state.showSideBar
    })
    this.props.doLogout()
    // this.props.redirectHomeTrue()
  }
  
  render() {
    return (
      <Header
        isLogin = {this.state.isLogin}
        isLogout = {this.state.isLogout}
        isLoginButtonClicked = {this.state.isLoginButtonClicked}
        userName = {this.state.userName}
        showMenuBg = {this.state.showMenuBg}
        showModal = {this._showModal}
        loginSuccess = {this._loginSuccess}
        localRegister = {this.props.localRegister}
        localLogin = {this.props.localLogin}
        onClickLogout = {this._onClickLogout}
        clickNickname = {this._clickNickname}
        onClickModalCancel = {this._onClickModalCancel}
        showSideBar = {this.state.showSideBar}
        user = {this.props.user}
        />
    )
  }
}

const mapStateToProps = (state) => {
  const { user } = state
  return {
    user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    doLogin : bindActionCreators(action.user.do_login, dispatch),
    doLogout : bindActionCreators(action.user.do_logout, dispatch),
    localRegister : bindActionCreators(action.user.local_register, dispatch),
    localLogin : bindActionCreators(action.user.local_login, dispatch),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(HeaderContainer)