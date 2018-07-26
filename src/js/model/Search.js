import axios from 'axios';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResult(query) {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const key = 'e9c1ef62530d7ad9a82d40fe7b3e1e39';
    try {
      const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.result = res.data.recipes; // recipes of the query 
    } catch(error) {
        alert(error);
    }
  }
}
