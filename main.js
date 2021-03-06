'use strict';
import React, { Component } from 'react';
import { AppRegistry, Picker, StyleSheet, Text, TouchableHighlight, View, Button } from 'react-native';
import { RTCView } from 'react-native-webrtc';

require('./apiRTC-React-latest.min.debug.js');

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		padding: 15,
		backgroundColor: 'white'
	},
  picker: {},
  remoteView: {
    width: 200,
    height: 150
  },
  selfView: {
    width: 200,
    height: 150,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});

const initialState = {
	initStatus : 'Registration ongoing',
	info: '',
	status: 'ready',
	selfViewSrc: null,
	remoteList: new Map(),
	connectedUsersList: [],
	selected: 'key1',
	callId: 0
};

class reactNativeApiRTC extends Component {

	constructor (props) {
		super(props);
    this.webRTCClient = null;
		this.state = initialState;

		React.onSessionReady = this._onSessionReady.bind(this);
		React.onConnectedUsersListUpdate = this._onConnectedUsersListUpdate.bind(this);
		React.onUserMediaSuccess = this._onUserMediaSuccess.bind(this);
		React.onRemoteStreamAdded = this._onRemoteStreamAdded.bind(this);
		React.onIncomingCall = this._onIncomingCall.bind(this);
		React.onHangup = this._onHangup.bind(this);

		this._call = this._call.bind(this);
		this._hangup = this._hangup.bind(this);
		this._manageHangup = this._manageHangup.bind(this);
	}

  componentDidMount () {
    //apiRTC initialization
    apiRTC.init({
    	apiKey: 'myDemoApiKey'
    });
  }

  componentWillUnmount () {
    //apiRTC initialization
    apiRTC.disconnect();
  }

	_onSessionReady () {
		console.log('_onSessionReady :' + apiRTC.session.apiCCId);
		this.webRTCClient = apiRTC.session.createWebRTCClient({});
		this.setState({status: 'ready', initStatus : 'You can be reached at this number :' + apiRTC.session.apiCCId , info: 'Select the destination number and Press "Video Call"'});
	}

	_onConnectedUsersListUpdate () {
	  console.log('_onConnectedUsersListUpdate');
	  this.setState({ connectedUsersList: apiRTC.session.getConnectedUsersList().map(user => user.userId).filter(id => id !== apiRTC.session.apiCCId) });
	}

	_onUserMediaSuccess (type, detail) {
	  console.log('_onUserMediaSuccess - type = ', type);
	  this.setState({ selfViewSrc: detail.stream.toURL() });
	}

	_onRemoteStreamAdded (type, detail) {
	  console.log('_onRemoteStreamAdded - type = ', type);
		this.setState({ info: 'Call established', remoteList: this.state.remoteList.set(this.state.callId, detail.stream.toURL()) });
	}

	_onIncomingCall (type, detail) {
	  console.log('_onIncomingCall - type = ', type);
	  this.setState({ status: 'connect', info: 'Incoming call from :' + detail.callerId });
	};

	_onHangup (type, detail) {
	  console.log('_onHangup - type = ', type);
		console.log('_onHangup - detail = ', detail);
	  this._manageHangup();
	};

  _call () {
    this.setState({ status: 'connect', info: 'Connecting' });
    const callId = this.webRTCClient.call(this.state.selected);
		this.setState({ callId });
  }

  _hangup() {
    this.webRTCClient.hangUp();
    this._manageHangup();
  }

  _manageHangup() {
    const remoteList = this.state.remoteList;
    remoteList.delete(this.state.callId);
    this.setState({
			status: 'ready',
			info: 'Select the destination number and Press "Video Call"',
			remoteList,
			selfViewSrc: undefined
		});
  }

	render () {

		function renderPicker (ctx) {
			if (ctx.state.status !== 'ready') return null;
			return (
				<View>
					<Picker
						style={ styles.picker }
						mode='dropdown'
						selectedValue={ ctx.state.selected }
						onValueChange={ itemValue => ctx.setState({ selected: itemValue }) }>
						{ ctx.state.connectedUsersList.length !== 0 ? ctx.state.connectedUsersList.map(item => <Picker.Item label={ item } value={ item } key={ item }/>) : [ <Picker.Item label={ 'No other connected user' } value={ 'No other connected user' } key={ 'noOtherConnectedUser' }/> ] }
					</Picker>
					<Button
  					onPress={ ctx._call }
  					title="Video Call"
  					color="#00CC00"
  					accessibilityLabel="Establish a video call"
					/>
				</View>
			);
		}

		function renderSelfView (ctx) {
			if (ctx.state.status === 'ready') return null;
			return <RTCView streamURL={ ctx.state.selfViewSrc } style={ styles.selfView }/>
		}

		function renderRemoteViews (ctx) {
			return Array.from(ctx.state.remoteList.values()).map((value, index) => <RTCView key={ index } streamURL={ value } style={ styles.remoteView }/>);
		}

		function renderHangUp (ctx) {
			if (ctx.state.status !== 'connect') return null;
			return (
				<Button
					onPress={ ctx._hangup }
					title="Hangup"
					color="#CC0000"
					accessibilityLabel="Hangup the video call"
				/>
			);
		}

		return (
			<View style={ styles.container }>
				<Text style={ styles.welcome }>{ this.state.initStatus }</Text>
				<Text style={ styles.welcome }>{ this.state.info }</Text>
				{ renderPicker(this) }
				{ renderSelfView(this) }
				{ renderRemoteViews(this) }
				{ renderHangUp(this) }
			</View>
		);
	}
}

AppRegistry.registerComponent('reactNativeApiRTC', () => reactNativeApiRTC);
