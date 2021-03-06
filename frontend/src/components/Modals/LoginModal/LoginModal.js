import React, { Component } from 'react'
import Modal from "react-modal"
import { connect } from 'react-redux'
import { bindActionCreators } from "redux"
import action from "action"
import styles from "./LoginModal.scss"
import classNames from "classnames/bind"
import TiTimes from 'react-icons/lib/ti/times'
import hellojs from "hellojs"
import axios from "axios"
import { Redirect } from "react-router-dom"
import { serverURL } from "jsconfig.json"

hellojs.init({
  facebook: 1611729235527991,
  google: '801032094039-7ebkgd5upmfogdtjiq0loc6m1aj5kma4.apps.googleusercontent.com'
}, {redirect_uri: '/redirect.html'})

const cx = classNames.bind(styles)

class LoginModal extends Component {
  state = { 
    showModal: false,
    redirectRegister : false,
    redirectHome : false,
    registerMode : false,
    registerEmail : '',
    emailErrorMsg : null,
    isEmailExist : false,
    passwd : null,
    passwdConfirm : false,
    passwdConfimMessgae : '',
    localEmail : null,
    localPasswd : null,
    class : {
      alertEmailInput : false
    }
   }
   
   _onChangeLocalEmail = (e) => {
     let email = e.target.value
     this.setState({
       ...this.state,
       localEmail : email
     })
   }
   _onChangeLocalPasswd = (e) => {
     let localPasswd = e.target.value
     this.setState({
       ...this.state,
       localPasswd : localPasswd
     })
   }
   _onCilckLocalLogin = async () => {
     try {
        await this.props.localLogin(this.state.localEmail, this.state.localPasswd)
        let err = this.props.user.error
        console.log(err)
        if (!err) {
          this._closeModal()
        }
     } catch (error) {
       
     }
   }

   componentWillReceiveProps(nextProps) {
     this.setState({
       showModal: nextProps.isLoginButtonClicked
      })
    }
    shouldComponentUpdate(nextProps,nextState) {
      return true
    }

  _googleLogin = async () => {
    try{
      await hellojs('google').login({
        scope: 'basic, email, photos'
      })
      let json = await hellojs('google').api('me')
      const { data } = await axios({
        method: 'POST',
        url: serverURL+'/auth/login',
        data: {
          picture: json.picture,
          email: json.email,
        },
        responseType: 'json'
      })
      if (!data.isUser) { // 소셜로그인 한 유저가 우리 유저가 아닐경우 
        console.log('소셜로그인 한 유저가 우리 유저가 아닐경우')
        this.props.loginSuccess(json.email, null, json.picture, true)
        this.setState({
          ...this.state,
          redirectRegister: true
        })
      } else { //소셜로그인 한 유저가 우리 유저일 경우
        //서버에서 로그인 요청이 정상적으로 되었다면
        localStorage.devfolio_token = data.token
        localStorage.email = data.email
        localStorage.displayName = data.displayName
        // 위의 두가지 값은 로그아웃시 깨끗이 없애주어야 한다
        console.log(data)
        this.props.loginSuccess(data.email, data.displayName, data.picture, true, data.space, data.language, data.follower )
        this.setState({
          ...this.state,
          redirectHome: !this.state.redirectHome
        })
      }
      this._closeModal()
    } catch (error) {
      alert('Signin error: ' + error.message)
    }
  }
    
  _facebookLogin = async () => {
    try {
      await hellojs('facebook').login({
        scope: 'friends, photos, publish'
      })
      let json = await hellojs('facebook').api('me',{width:200, height:200})
      console.log(json)
      const { data } = await axios({
        method: 'POST',
        url: serverURL+'/auth/login',
        data: {
          picture: json.picture,
          email: json.email,
        },
        responseType: 'json'
      })
      if (!data.isUser) { // 소셜로그인 한 유저가 우리 유저가 아닐경우 
        this.props.loginSuccess(json.email, null, json.picture, true)
        this.setState({
          ...this.state,
          redirectRegister: true
        })
      } else { //소셜로그인 한 유저가 우리 유저일 경우
        console.log(data)
        //서버에서 로그인 요청이 정상적으로 되었다면
        localStorage.devfolio_token = data.token
        localStorage.email = data.email
        localStorage.displayName = data.displayName
        // 위의 두가지 값은 로그아웃시 깨끗이 없애주어야 한다
        this.props.loginSuccess(data.email, data.displayName, data.picture, true, data.space, data.language, data.follower )
        this.setState({
          ...this.state,
          redirectHome: !this.state.redirectHome
        })
      }
      this._closeModal()
    } catch (error) {
        alert('Signin error: ' + error.message)
    }
  }

  _closeModal = () => {
    this.props.onClickModalCancle()
    this.setState({
      showModal : false,
      registerMode : false
    })
  }

  _onClickRegisterOrLogin = () => {
    console.log('registerMode ture');
    this.setState({
      ...this.state,
      registerMode : !this.state.registerMode
    })
  }

  _emailCheck = async () => {
    if(this.state.class.alertEmailInput || this.state.emailErrorMsg){
      alert('삐~')
      return
    }
    const { data } = await axios({
      method : 'GET',
      url : serverURL+'/auth/emailCheck',
      params:{
        email : this.state.registerEmail 
      }
    })
    const {message,isExist} = data
    if(isExist){
      this.setState({
        ...this.state,
        isEmailExist : isExist,
        emailErrorMsg : message
      })
    }else{
      this.props.localRegister(this.state.registerEmail, this.state.passwd)
      this.setState({
        ...this.state,
        isEmailExist : isExist,
        emailErrorMsg : message,
        redirectRegister: true
      })
    }
  }

  _onChangeRegisterEmail = (e) => {
    if (e.target.value)
    this.setState({
      ...this.state,
      registerEmail : e.target.value
    })
  }

  _onChangePwd = (e) => {
    this.setState({
      ...this.state,
      passwd : e.target.value
    })
  }

  _onChangePwd2 = (e) => {
    if(e.target.value == this.state.passwd) {
      this.setState({
        ...this.state,
        passwdConfirm:true,
        passwdConfimMessgae : '일치'
      })
      console.log('같습니다')
    }else {
      this.setState({
        ...this.state,
        passwdConfirm: false,
        passwdConfimMessgae : '불일치'
      })
    }
  }
    
  _emailValidation = (e) => {
    let email = e.target.value
    console.log(email)
    if(!email.includes("@") || !email.includes(".")) {
      this.setState({
        ...this.state,
        class : {
          alertEmailInput : true
        }
      })
    }else {
        this.setState({
          ...this.state,
          class : {
            alertEmailInput : false
          }
        })
    }
  }
  render() {
    let { redirectRegister, redirectHome ,registerMode } =  this.state
    let { error } = this.props.user
    console.log(error)
    if (redirectRegister) {
      return <Redirect to="/register"/>
    }
    if(this.props.isLogout) {
      console.log('리다이렉트 홈 by logout')
      return <Redirect to="/"/>
    }

      if(!registerMode){
        return(
          <Modal
            isOpen={this.state.showModal}
            onRequestClose={() => {this._closeModal()}}
            className={cx('content')}
            contentLabel="Minimal Modal Example"
          >   
            <button className={cx('closeBtn')}
                    onClick={() => {this._closeModal()}}><TiTimes size={32} /></button>
            <div className={cx('loginBox')}>
            
              <h1>Login Here</h1>
              <h2>Email</h2>
              <input type = "text" 
                  onChange ={this._onChangeLocalEmail} 
                  className={cx('inputype',{inputAlert : this.state.class.alertEmailInput})} 
                  placeholder="Enter email" 
                  onBlur = {this._emailValidation}
                  />
              {this.state.class.alertEmailInput ? <span>이메일형식x</span> : null}
                <h2>Password</h2>
              <div className={cx('loginPasswordBox')}>
                <input type = "password" onChange = {this._onChangeLocalPasswd} className={cx('inputype')} placeholder="Enter Password" />
                <button onClick = {this._onCilckLocalLogin} className={cx('')}> Login </button>
                {error ? <p>login error!!</p> : null}
              </div>
              <br/>
              <p onClick={this._onClickRegisterOrLogin}> Don't have an account? </p>
              

              <button 
                onClick={()=>{this._googleLogin()}}
                className={cx('googleLogin')}>Google Login</button>
              <button 
                onClick={()=>{this._facebookLogin()}}
                className={cx('facebookLogin')}>Facebook Login</button>
            </div>
          </Modal>
        )
      } else {
        return (
          <Modal
          isOpen={this.state.showModal}
          onRequestClose={() => {this._closeModal()}}
          className={cx('content')}
          contentLabel="Minimal Modal Example"
          >   
            <button className={cx('closeBtn')}
                  onClick={() => {this._closeModal()}}><TiTimes size={32} /></button>
            <div className={cx('loginBox')}>
          
            <h1>Register</h1>
            <i className="icon-aperture animate-spin"></i>
            
            <h2>Email</h2>
            <input type = "text" className={cx('inputype')} 
                    onChange = {this._onChangeRegisterEmail}
                    className={cx('inputype',{inputAlert : this.state.class.alertEmailInput})}
                    onBlur = {this._emailValidation}
                    placeholder="Enter Email"
                     />
            {this.state.isEmailExist ? <p>{this.state.emailErrorMsg}</p> : null }
              <h2>Password</h2>
            <div className={cx('passwordBox')}>
              <input type = "password" onChange={this._onChangePwd} className={cx('inputype')} placeholder="Enter Password" /> 
              <input type = "password" onChange={this._onChangePwd2} className={cx('inputype')} placeholder="Confirm Password" /> 
              <p>
               <button className={cx('')} onClick={this._emailCheck} >Register</button>
              </p>
              {this.state.passwdConfirm ? <p>{this.state.passwdConfimMessgae}</p> : <p>{this.state.passwdConfimMessgae}</p> }
            </div>
            <p onClick={this._onClickRegisterOrLogin}> already have an account? </p>

            <button 
              onClick={()=>{this._googleLogin()}}
              className={cx('googleLogin')}>Google Login</button>
            <button 
              onClick={()=>{this._facebookLogin()}}
              className={cx('facebookLogin')}>Facebook Login</button>
          </div>
        </Modal>)
      }
  }

}

const mapStateToProps = (state) => {
  const {user} = state
  return {
    user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    localLogin : bindActionCreators(action.user.local_login, dispatch)
  }
}


export default connect(mapStateToProps,mapDispatchToProps)(LoginModal)
