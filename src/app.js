import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  CameraRoll,
  Image,
  Modal,
  ScrollView,
  TouchableHighlight,
  Dimensions,
  Platform
} from 'react-native';

import RNFetchBlob from 'react-native-fetch-blob';

import firebase from 'firebase';
import ImagePicker from 'react-native-image-picker';

import StatusBar from './components/StatusBar';

import styles from './styles';

const { width } = Dimensions.get('window');


// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

export default class EventPhotoShareApp extends Component {
  constructor(){
    super()
    this.getImage = this.getImage.bind(this)
    this.state = {
      modalVisible: false,
      photos: [],
      index: null
    }
  }

  // More info on all the options is below in the README...just some common use cases shown here
  options = {
    title: 'Select Avatar',
    customButtons: [
      {name: 'fb', title: 'Choose Photo from Facebook'},
    ],
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  };

  setIndex = (index) => {
    if (index === this.state.index) {
      index = null
    }
    this.setState({ index })
  }

  getImage(){

      ImagePicker.showImagePicker( (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        }
        else {
          // let source = { uri: response.uri };
          // this.setState({image_uri: response.uri})

          // You can also display the image using data:
          // let image_uri = { uri: 'data:image/jpeg;base64,' + response.data };

        this.uploadImage(response.uri)
          .then(url => { alert('uploaded'); this.setState({image_uri: url}) })
          .catch(error => console.log(error))

        }
      });

    }

  getPhotos = () => {
    CameraRoll.getPhotos({
      first: 20,
    })
    .then(r => this.setState({ photos: r.edges }))
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  uploadImage(uri, mime = 'application/octet-stream') {
      return new Promise((resolve, reject) => {
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
        let uploadBlob = null

        const imageRef = firebaseApp.storage().ref('images').child('image_001')

        fs.readFile(uploadUri, 'base64')
          .then((data) => {
            return Blob.build(data, { type: `${mime};BASE64` })
          })
          .then((blob) => {
            uploadBlob = blob
            return imageRef.put(blob, { contentType: mime })
          })
          .then(() => {
            uploadBlob.close()
            return imageRef.getDownloadURL()
          })
          .then((url) => {
            resolve(url)
          })
          .catch((error) => {
            reject(error)
        })
      })
    }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar title='Evento'/>
          <View style={styles.centeredContainer}>
          <Button
            onPress={this.getImage}
            title="Enviar fotos"/>
          <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => console.log('closed')}
          >
            <View style={styles.modalContainer}>
              <Button
                title='Close'
                onPress={this.toggleModal}
              />
              <ScrollView
                contentContainerStyle={styles.scrollView}>
                {
                  this.state.photos.map((p, i) => {
                    return (
                      <TouchableHighlight
                        style={{opacity: i === this.state.index ? 0.5 : 1}}
                        key={i}
                        underlayColor='transparent'
                        onPress={() => this.setIndex(i)}
                      >
                        <Image
                          style={{
                            width: width/3,
                            height: width/3
                          }}
                          source={{uri: p.node.image.uri}}
                        />
                      </TouchableHighlight>
                    );
                  })
                }
              </ScrollView>
              {
              this.state.index !== null  && (
                <View style={styles.shareButton}>
                  <Button
                      title='Share'
                      onPress={this.share}
                    />
                </View>
              )
            }
            </View>
          </Modal>
          </View>
      </View>
    );
  }
}
