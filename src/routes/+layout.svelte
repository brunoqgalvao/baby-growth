<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>BabyGrowth</title>
</svelte:head>

{@render children()}
