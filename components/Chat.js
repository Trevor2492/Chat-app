import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import '@firebase/auth';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';


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
			},
			isConnected: false
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

		// IF statement checks to see if the user is online. If they are, pull messages from firestore, if not, pull messages from local storage (AsyncStorage)
		NetInfo.fetch().then(connection => {
			if (connection.isConnected) {
				console.log('online');
				this.setState({
					isConnected: true
				});

				this.referenceChatMessages = firebase.firestore().collection("messages");
				// this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate); // This line is no longer needed after we created the authorization logic
		
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
			} else {
				console.log('offline');
				this.setState({
					isConnected: false
				});
				this.getMessages();
				window.alert('You are offline and won\'t be able to send messages until you are online');
			}
		});

	}

	// Gets the messages from local storage so that they can be viewed when offline
	async getMessages() {
		let messages = '';
		try {
			messages = await AsyncStorage.getItem('messages') || [];
			this.setState({
				messages: JSON.parse(messages)
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	// Saves the chats messages in local storage each time a new message gets sent
	async saveMessages() {
		try {
			await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
		} catch (error) {
			console.log(error.message);
		}
	}

	// This isn't called anywhere in the code. It's simply here if I want to use it during development
	async deleteMessages() {
		try {
			await AsyncStorage.removeItem('messages');
			this.setState({
				messages: []
			})
		} catch (error) {
			console.log(error.message);
		}
	}

	// This unsubscribes from firestore and authorization when the component unmounts, forcing the app to stop listening for updates to the store
	componentWillUnmount(){
		this.unsubscribe();
		this.authUnsubscribe();
	}

	// Updates this.state.messages after a new instance of a chat message hits the firestore
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
			this.saveMessages();
    });
  }

	// Creates a new instance of a chat message in the firestore
	addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

	// This method comes with GiftedChat to render the chat bubble props
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

	// Only render the input toolbar if the user is online
	renderInputToolbar(props) {
		if(this.state.isConnected == false) {
			// This is intentionally left blank
		} else {
			return (
				<InputToolbar {...props}/>
			);
		}
	}

	render() {
		// passed this from the "start" screen
		let color = this.props.route.params.color;

		return (
			<View style={{ flex: 1, backgroundColor: color }}>

				<GiftedChat
					renderBubble={this.renderBubble.bind(this)}
					renderInputToolbar={this.renderInputToolbar.bind(this)}
					messages={this.state.messages}
					onSend={messages => this.onSend(messages)}
					user={this.state.user}
				/>

				{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height'/> : null }

			</View>
		)
	}
}
