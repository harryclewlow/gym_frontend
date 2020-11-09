<template>
    <div class="error">
        <b-container class="pt-4">
            <div>Error: {{ errorCode }}</div>
        </b-container>
    </div>
</template>

<script>
    export default {
        name: 'ErrorPage',
        props: {
            errorCode: String
        }
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
