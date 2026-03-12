<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>BabyGrowth</title>
	<meta name="description" content="Track your little one's growth with real WHO & CDC charts" />
</svelte:head>

{@render children()}
