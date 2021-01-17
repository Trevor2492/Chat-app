import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';

export default class Chat extends Component {

	constructor() {
		super();
		this.state = {
			messages: [],
		}
	}

	componentDidMount() {
		const name = this.props.route.params.name;

		// Sets the title of the chat page to be the name of the user. THIS IS WHERE THE WARNING IS COMING FROM
		this.props.navigation.setOptions({ title: name }); 


		this.setState({
			messages: [
				{
					_id: 1,
					text: 'Hello developer',
					createdAt: new Date(),
					user: {
						_id: 2,
						name: 'React Native',
						avatar: 'https://placeimg.com/140/140/any',
					},
				},
				{
					_id: 2,
					text: name + ' has entered the chat',
					createdAt: new Date(),
					system: true,
				},
			],
		})
	}

	onSend(messages = []){
		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}));
	}

	renderBubble(props) {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: '#000'
					}
				}}
			/>
		)
	}

	render() {
		// passed these from the "start" screen
		let color = this.props.route.params.color;

		return (
			<View style={{ flex: 1, backgroundColor: color }}>

				<GiftedChat
					renderBubble={this.renderBubble.bind(this)}
					messages={this.state.messages}
					onSend={messages => this.onSend(messages)}
					user={{_id: 1}}
				/>

				{ Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height'/> : null }

			</View>
		)
	}
}
