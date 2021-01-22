import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import '@firebase/auth';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {

	constructor() {
		super();
		this.state = {
			messages: [],
			user: {
				_id: '',
				name: '',
        avatar: '',
        createdAt: ''
			}
		}


		// grabs the database from firebase/cloud firestore (initializes the firestore app)
    if (!firebase.apps.length){
      firebase.initializeApp({
				apiKey: "AIzaSyCCG1qp7vArHbojdS_aW_alV-le3JRA68A", // pulled all this stuff from firestore
				authDomain: "chat-app-41bbf.firebaseapp.com",
				projectId: "chat-app-41bbf",
				storageBucket: "chat-app-41bbf.appspot.com",
				messagingSenderId: "413945673648",
				appId: "1:413945673648:web:15af400ffc12a88e018875",
				measurementId: "G-RF8CN0CXF7"
      });
    }
	}

	componentDidMount() {
		const name = this.props.route.params.name; // sent over from the start screen
		this.props.navigation.setOptions({ title: name }); // Sets the title of the chat page to be the name of the user.

		this.referenceChatMessages = firebase.firestore().collection("messages");
		// this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);

		this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				firebase.auth().signInAnonymously();
			}

			this.setState({
				user: {
					_id: user.uid,
					name: name,
					avatar: "https://placeimg.com/140/140/any",
					createdAt: new Date()
				},
				messages: [],
			});

			this.unsubscribe = this.referenceChatMessages
				.orderBy("createdAt", "desc")
				.onSnapshot(this.onCollectionUpdate);

		});

	}

	componentWillUnmount(){
		this.unsubscribe();
		this.authUnsubscribe();
	}

	onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
			var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        }
      });
    });
    this.setState({
      messages,
    });
  }

	onSend(messages = []) {
    // setState is called with previousState as the parameter -> reference to the component's
    // state at the time the change is applied.
    this.setState(previousState => ({
      // the append function by Gifted chat appends the new message to the message obj.
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.addMessage();
    });
  }

	addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: 'darkgray'
					}
				}}
			/>
		)
	}

	render() {
		// passed this from the "start" screen
		let color = this.props.route.params.color;

		return (
			<View style={{ flex: 1, backgroundColor: color }}>

				<GiftedChat
					renderBubble={this.renderBubble.bind(this)}
					messages={this.state.messages}
					onSend={messages => this.onSend(messages)}
					user={this.state.user}
				/>

				{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height'/> : null }

			</View>
		)
	}
}
