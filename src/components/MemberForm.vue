<template>
  <div class="member-form">

    <b-container class="pt-4">
      <!--      Step One      -->
      <div id="step_one" v-if="currentStep === 1">
        <b-row class="mb-4">
          <b-form-select id="location" v-model="locationSelected" :options="locationOptions"></b-form-select>
        </b-row>
        <b-row>
          <b-button v-on:click="stepOneNext" :disabled="locationSelected === null" size="lg" variant="primary">Next</b-button>
        </b-row>
      </div>

      <!--      Step Two      -->
      <div id="step_two" v-if="currentStep === 2">
        <b-row class="mb-4">
          <b-form-select id="membership" v-model="membershipSelected" :options="membershipOptions"></b-form-select>
        </b-row>
        <b-row>
          <b-button v-on:click="stepTwoPrevious" size="lg" variant="primary">Previous</b-button>
          <b-button class="ml-4" :disabled="!membershipSelected" v-on:click="stepTwoNext" size="lg" variant="primary">Next</b-button>
        </b-row>
      </div>

      <!--      Step Three      -->
      <div id="step_three" v-if="currentStep === 3">
        <b-row>
          <b-form>
            <div id="step_three_errors">
              <b-alert v-for="(error, index) in errors" :key="`error-${index}`" variant="danger" show>{{ error }}</b-alert>
            </div>
            <b-form-group id="first_name_group" label="First Name:" label-for="first_name_input">
              <b-form-input id="first_name_input" v-model="form.firstName" type="text" required></b-form-input>
            </b-form-group>
            <b-form-group id="surname_group" label="Surname:" label-for="surname_input">
              <b-form-input id="surname_input" v-model="form.surname" type="text" required></b-form-input>
            </b-form-group>
            <b-form-group id="email_group" label="Email:" label-for="email_input">
              <b-form-input id="email_input" v-model="form.email" type="email" required></b-form-input>
            </b-form-group>
            <b-form-group id="mobile_number_group" label="Mobile Number (UK):" label-for="mobile_number_input">
              <b-input-group prepend="+447">
                <b-form-input id="mobile_number_input" ma v-model="form.mobileNumber" :formatter="formatNumber" type="number" required></b-form-input>
              </b-input-group>
            </b-form-group>
            <b-form-group id="postcode_group" label="Postcode (UK):" label-for="postcode_input">
              <b-form-input id="postcode_input" v-model="form.postcode" type="email" :formatter="formatPostcode" required></b-form-input>
            </b-form-group>
            <b-form-group id="dob_group">
              <label for="dob">Date Of Birth (Must be over 18):</label>
              <b-form-datepicker id="dob" v-model="form.dateOfBirth" class="mb-2"></b-form-datepicker>
            </b-form-group>
            <b-form-group id="checkboxes">
              <b-form-checkbox-group v-model="form.checkboxes">
                <b-form-checkbox value="terms">I agree to terms and conditions</b-form-checkbox>
                <b-form-checkbox value="newsletter">I want to receive regular updates about Atom 42</b-form-checkbox>
              </b-form-checkbox-group>
            </b-form-group>
            <b-row>
              <b-button v-on:click="stepThreePrevious" size="lg" variant="primary">Previous</b-button>
              <b-button class="ml-4" :disabled="showStepThreeNext" v-on:click="stepThreeNext" size="lg" variant="primary">Next</b-button>
            </b-row>
          </b-form>
        </b-row>
      </div>

      <!--      Step Four      -->
      <div id="step_four" v-if="currentStep === 4 && !postingData">
        <b-row>
          <div id="confirm_gym">Gym: {{ currentGymOption.text }}</div>
        </b-row>
        <b-row>
          <div id="confirm_membership_name">Membership: {{ currentMembershipOption.text }}</div>
        </b-row>
        <b-row>
          <div id="confirm_name">Name: {{ form.firstName }} {{ form.surname }}</div>
        </b-row>
        <b-row>
          <div id="confirm_dob">Date of Birth: {{ form.dateOfBirth }}</div>
        </b-row>
        <b-row>
          <div id="confirm_email">Email: {{ form.email }}</div>
        </b-row>
        <b-row>
          <div id="confirm_postcode">Postcode: {{ form.postcode }}</div>
        </b-row>
        <b-row>
          <div id="confirm_number">Mobile Number: {{ form.mobileNumber }}</div>
        </b-row>
        <b-row>
          <b-button v-on:click="cancel" size="lg" variant="danger">Cancel</b-button>
          <b-button class="ml-4" v-on:click="confirm" size="lg" variant="success">Confirm</b-button>
        </b-row>
      </div>

      <!--      Posting     -->
      <div v-if="currentStep === 4 && postingData" class="text-center">
        <b-spinner label="Spinning"></b-spinner>
      </div>

      <!--      Pending Modal     -->
      <div>
        <b-modal ref="pending_model" hide-footer title="You already have a pending membership">
          <div class="d-block text-center">
            <h3>Do you wish to remove it and continue with this membership?</h3>
          </div>
          <b-button class="mt-3" variant="outline-danger" block @click="cancelModel">Cancel</b-button>
          <b-button class="mt-2" variant="outline-warning" block @click="updateModel">Yes, update</b-button>
        </b-modal>
      </div>

      <!--      Active Modal     -->
      <div>
        <b-modal ref="active_model" hide-footer title="Membership already active">
          <div class="d-block text-center">
            <h3>There is already an active membership in use for this email</h3>
          </div>
          <b-button class="mt-2" variant="outline-warning" block @click="cancel">Go back</b-button>
        </b-modal>
      </div>

    </b-container>
  </div>
</template>

<script>
import axios from "axios";
export default {

  name: 'MemberForm',
  data() {
    return {
      gyms: [],
      errors: [],
      postingData: false,
      currentStep: 1,
      locationSelected: null,
      membershipSelected: null,
      locationOptions: [
        { value: null, text: 'Please select a location' }
      ],
      membershipOptions: [
        { value: null, text: 'Please select a membership package' },
      ],
      form: {
        firstName: '',
        surname: '',
        email: '',
        mobileNumber: '',
        postcode: '',
        dateOfBirth: '',
        checkboxes: []
      },
    }
  },
  mounted() {
    axios.get('http://atom42.gym/gym')
    .then((resp => {
      this.gyms = resp.data;
      this.gyms.forEach((gym, i) => {
        this.locationOptions.push({value: i, text: gym.name});
      })
    }))
    .catch((err => {
      const errorCode = err.response.status
      this.$router.push({ name: 'ErrorPage', params: {errorCode: errorCode }})
    }))

  },
  computed: {
    showStepThreeNext: function () {
      return !(this.form.firstName !== '' &&
              this.form.surname !== '' &&
              this.form.email !== '' &&
              this.form.mobileNumber !== '' &&
              this.form.postcode !== '' &&
              this.form.dateOfBirth !== '' &&
              this.form.checkboxes.includes('terms'));
    },
    currentGymOption() {
      return this.locationOptions.find(option => option.value === this.locationSelected);
    },
    currentMembershipOption() {
      return this.membershipOptions.find(option => option.value === this.membershipSelected);
    }
  },
  methods: {
    cancelModel() {
      this.$refs['pending_model'].hide();
      this.cancel();
      this.postingData = false;
    },
    updateModel() {
      this.$refs['pending_model'].hide();
      const formData = new FormData();
      formData.append('email', this.form.email);

      axios.post('http://atom42.gym/member/clear-pending', formData)
      .then(() => {
        this.confirm();
      })
      .catch((err => {
        const errorCode = err.response.status
        this.$router.push({ name: 'ErrorPage', params: {errorCode: errorCode }})
      }))
    },
    showModal() {
      this.$refs['pending_model'].show()
    },
    showActiveModal() {
      this.$refs['active_model'].show()
    },
    formatNumber(e){
      return String(e).substring(0,9);
    },
    formatPostcode(e){
      return String(e).substring(0,7);
    },
    stepOneNext: function () {
      this.currentStep = 2;
      this.gyms[this.locationSelected].memberships.forEach((membership) => {
        const text = membership.membership_type.name + ' - £' + membership.price;
        this.membershipOptions.push({value: membership.hash, text: text});
      })
    },
    stepTwoPrevious: function () {
      this.membershipSelected = null;
      this.membershipOptions = [{ value: null, text: 'Please select a membership package' }];
      this.currentStep = 1;
    },
    stepTwoNext: function () {
      this.currentStep = 3;
    },
    stepThreePrevious: function () {
      this.errors = [];
      this.form.firstName = '';
      this.form.surname = '';
      this.form.email = '';
      this.form.mobileNumber = '';
      this.form.postcode = '';
      this.form.dateOfBirth = '';
      this.form.checkboxes = [];
      this.currentStep = 2;
    },
    stepThreeNext: function () {
      this.errors = [];
      this.validateStepThree();
      if (this.errors.length === 0) {
        this.currentStep = 4;
      }
    },
    cancel: function () {
      this.$refs['active_model'].hide();
      this.errors = [];
      this.form.firstName = '';
      this.form.surname = '';
      this.form.email = '';
      this.form.mobileNumber = '';
      this.form.postcode = '';
      this.form.dateOfBirth = '';
      this.form.checkboxes = [];
      this.membershipSelected = null;
      this.membershipOptions = [{ value: null, text: 'Please select a membership package' }];
      this.locationSelected = null;
      this.currentStep = 1;
    },
    validateStepThree: function () {
      if (this.form.firstName === '') {
        this.errors.push('First name missing');
      }

      if (this.form.surname === '') {
        this.errors.push('Surname missing');
      }

      if (this.form.surname === '') {
        this.errors.push('Email missing');
      } else if (!this.validateEmail()) {
        this.errors.push('Email invalid');
      }

      if (this.form.mobileNumber.length !== 9) {
        this.errors.push('Mobile number invalid length');
      }

      const postcodeLength = this.removeSpacesAndHyphens(this.form.postcode).length;
      if (postcodeLength < 5 || postcodeLength > 7) {
        this.errors.push('Postcode invalid length');
      }

      if (this.form.dateOfBirth === '') {
        this.errors.push('Date of birth missing');
      } else if (!this.isOverEighteen()) {
        this.errors.push('Must be over 18');
      }

      if (!this.form.checkboxes.includes('terms')) {
        this.errors.push('Terms must be accepted');
      }
    },
    validateEmail: function () {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;
      return re.test(this.form.email.toLowerCase());
    },
    removeSpacesAndHyphens: function (string) {
      return string.replace(/-|\s/g,"");
    },
    isOverEighteen: function () {
      const dob = this.removeSpacesAndHyphens(this.form.dateOfBirth);
      const year = Number(dob.substr(0, 4));
      const month = Number(dob.substr(4, 2)) - 1;
      const day = Number(dob.substr(6, 2));
      const today = new Date();
      let age = today.getFullYear() - year;
      if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
        age--;
      }

      return age >= 18
    },
    confirm: function () {
      this.postingData = true;
      const formData = new FormData();
      formData.append('givenNames', this.form.firstName);
      formData.append('surname', this.form.surname);
      formData.append('email', this.form.email);
      formData.append('mobileNumber', '+447' + this.form.mobileNumber);
      formData.append('postcode', this.removeSpacesAndHyphens(this.form.postcode));
      formData.append('dateOfBirth', this.form.dateOfBirth);
      formData.append('termsAccepted', this.form.checkboxes.includes('terms'));
      formData.append('newsletterAccepted', this.form.checkboxes.includes('newsletter'));
      formData.append('membershipHash', this.membershipSelected);

      axios.post('http://atom42.gym/member', formData)
      .then((resp => {
        this.postingData = false
        const params = {
          membershipHash: resp.data.pendingMemberMembershipHash,
          membershipName: resp.data.membership_type.name,
          membershipPrice: resp.data.price,
          email: resp.data.email,
          gym:  resp.data.gym
        }
        this.$router.push({ name: 'PaymentGateway', params: { membership: params }})
      }))
      .catch((err => {
        this.postingData = false
        const errorCode = err.response.status
        if (errorCode === 422) {
          this.showModal()
        } else if (errorCode === 409) {
          this.showActiveModal()
        } else {
          this.$router.push({ name: 'ErrorPage', params: {errorCode: errorCode }})
        }
      }))
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
