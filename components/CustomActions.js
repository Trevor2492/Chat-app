import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const firebase = require('firebase');
require('firebase/firestore');


// This class renders the '+' in the input bar
export default class CustomActions extends Component {

	// Gets permission to use the imagePicker and sets the selected image to state
	pickPhoto = async () => {
		const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

		console.log('camera roll status: ' + status);

		if (status === 'granted') {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: 'Images',
			}).catch(error => console.log(error));

			if (!result.cancelled) {
				const imageUrl = await this.uploadImageFetch(result.uri);
				console.log('imageUrl: ' + imageUrl);
				this.props.onSend({ image: imageUrl });
			}

		} else {
			window.alert('Camera Roll Access Denied');
		}

	}

	// Gets permission to use the camera and save the image to state
	takePhoto = async () => {
		const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);

		console.log('camera status: ' + status);

		if (status === 'granted') {
			let result = await ImagePicker.launchCameraAsync().catch(error => console.log(error));

			if (!result.cancelled) {
				const imageUrl = await this.uploadImageFetch(result.uri);
				this.props.onSend({ image: imageUrl });
			}

		} else {
			window.alert('Camera Access Denied');
		}

	}

	// Gets the users location and updates the state if permission is granted
	getLocation = async () => {
		const { status } = await Permissions.askAsync(Permissions.LOCATION);

		if (status === 'granted') {
			// this location accuracy has to be set to "high" otherwise I get an error "Location provider is unavailable. Make sure that location services are enabled."
			let result = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High}); 

			const longitude = JSON.stringify(result.coords.longitude);
			const latitude = JSON.stringify(result.coords.latitude);

			if (result) {
				this.props.onSend({
					location: {
						longitude,
						latitude,
					}
				});
			}

		} else {
			window.alert('Location Access Denied');
		}
	}

	// Uploads the user's chosen image to firebase cloud storage and returns the image URL
	uploadImageFetch = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split("/");
    const imageName = imageNameBefore[imageNameBefore.length - 1];

    const ref = firebase.storage().ref().child(`images/${imageName}`);

    const snapshot = await ref.put(blob);

    blob.close();

    return await snapshot.ref.getDownloadURL(); // Returns the URL for the specific image from firestore storage
  };
	

	onActionPress = () => {
		const options = ['Choose photo from Library', 'Take Picture', 'Send Location', 'Cancel'];
		const cancelButtonIndex = options.length - 1;

		this.context.actionSheet().showActionSheetWithOptions(
			{
				options, cancelButtonIndex
			},

			async (buttonIndex) => {
				switch (buttonIndex) {
					case 0:
						console.log('user wants to pick an image');
						return this.pickPhoto();
					case 1:
						console.log('user wants to take a photo');
						return this.takePhoto();
					case 2:
						console.log('user wants to get their location');
						return this.getLocation();
				}
			},
		);
	};


	render() {
		return (
			<TouchableOpacity 
				accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Let’s you choose to send an image or your geolocation."
				style={[styles.container]} 
				onPress={this.onActionPress}
			>
       <View style={[styles.wrapper, this.props.wrapperStyle]}>
         <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
       </View>
     </TouchableOpacity>
		)
	}
}

//Styles for the '+' button
const styles = StyleSheet.create({
	container: {
		width: 26,
		height: 26,
		marginLeft: 10,
		marginBottom: 10,
	},
	wrapper: {
		borderRadius: 13,
		borderColor: '#b2b2b2',
		borderWidth: 2,
		flex: 1,
	},
	iconText: {
		color: '#b2b2b2',
		fontWeight: 'bold',
		fontSize: 16,
		backgroundColor: 'transparent',
		textAlign: 'center',
	},
});

CustomActions.contextTypes = {
	actionSheet: PropTypes.func,
 };