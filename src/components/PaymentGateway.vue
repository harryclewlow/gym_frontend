<template>
    <div class="payment_gateway">
        <div>
            <div v-if="!paidFor">
                <h1>Purchase Membership</h1>
                <p>Email: {{ membership.email }}</p>
                <p>Gym: {{ membership.gym.name }}</p>
                <p>Membership Type: {{ membership.membershipName }}</p>
                <p>Price: £{{ membership.membershipPrice }}</p>
            </div>

            <div v-if="paidFor">
                <h1>Success!</h1>
                <p>Expiry Date: {{ expiryDate }}</p>
            </div>

            <div v-if="!paidFor" ref="paypal"></div>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    export default {
        name: 'PaymentGateway',
        props: {
            membership: Object
        },
        data: function() {
            return {
                loaded: false,
                paidFor: false,
                expiryDate: ''
            };
        },
        mounted: function() {
            const script = document.createElement("script");
            script.src =
                "https://www.paypal.com/sdk/js?client-id=Aas8K7ixpqVsEirdWSn3RLiqE1FfxO5oqSOXI5btzkX21CNm_rveYUD5RwtXlu42_baoVj9CehJKYbDv&currency=GBP";
            script.addEventListener("load", this.setLoaded);
            document.body.appendChild(script);
        },
        methods: {
            setLoaded: function() {
                this.loaded = true;
                window.paypal
                    .Buttons({
                        createOrder: (data, actions) => {
                            return actions.order.create({
                                purchase_units: [
                                    {
                                        description: this.membership.membershipName,
                                        amount: {
                                            currency_code: "GBP",
                                            value: this.membership.membershipPrice
                                        }
                                    }
                                ]
                            });
                        },
                        onApprove: async () => {
                            const formData = new FormData();
                            formData.append('memberMembershipHash', this.membership.membershipHash);
                            console.log(formData)
                            axios.post('http://atom42.gym/member/confirm', formData)
                                .then((resp => {
                                    this.expiryDate = resp.data.expiry_date
                                    this.paidFor = true;
                                }))
                                .catch((err => {
                                    const errorCode = err.response.status
                                    this.$router.push({ name: 'ErrorPage', params: {errorCode: errorCode }})
                                }))
                        },
                        onError: err => {
                            const errorCode = err.response.status
                            this.$router.push({ name: 'ErrorPage', params: {errorCode: errorCode }})
                        }
                    })
                    .render(this.$refs.paypal);
            }
        }
    };
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
