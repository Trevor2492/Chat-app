import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export default class Start extends Component {

	constructor(props) {
		super(props);
		this.state = { 
			name: '',
			color: 'white'
		};
	}


	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ margin: 10 }}>Enter Name</Text>

				{/* This is the name input */}
				<TextInput
					style={{height: 40, borderColor: 'gray', borderWidth: 1, width: 250, padding: 5, margin: 10}}
					onChangeText={name => this.setState({name})}
					value={this.state.name}
					placeholder='Name'	
				/>

				{/* This section creates the colors for the user to choose from for the chat screen */}
				<Text style={{ margin: 10 }}>Choose a color for Chat: </Text>
				<View style={styles.container}>
					<TouchableOpacity style={styles.box1} onPress={() => {this.setState({color: 'lightblue'})}}></TouchableOpacity>
					<TouchableOpacity style={styles.box2} onPress={() => {this.setState({color: 'pink'})}}></TouchableOpacity>
					<TouchableOpacity style={styles.box3} onPress={() => {this.setState({color: 'lightgreen'})}}></TouchableOpacity>
				</View>

				<Text>You picked: </Text>
				<Text style={{ backgroundColor: this.state.color,  borderStyle: 'solid', borderWidth: 1, borderColor: 'gray', margin: 5, marginBottom: 30, padding: 4 }}> {this.state.color} </Text>

				<Button title="Go to Chat" onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })} />

			</View>
		)
	}
}

const styles = StyleSheet.create({
  container: {
		flexDirection: 'row',
		width: 300,
  },
  box1: {
    flex:1,
		backgroundColor: 'lightblue',
		height: 100,
		borderRadius: 50
  },
  box2: {
    flex:1,
		backgroundColor: 'pink',
		borderRadius: 50
  },
  box3: {
    flex:1,
		backgroundColor: 'lightgreen',
		borderRadius: 50
	},
});