<script>
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="container mx-auto flex flex-col items-center px-4 py-16">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold md:text-6xl">Amma Idli House</h1>
		<p class="text-xl text-muted-foreground">Authentic South Indian Cuisine</p>
		<Separator class="mx-auto my-6 max-w-md" />
		<p class="mx-auto max-w-md">
			Experience the rich flavors of traditional South Indian dishes, made with love and authentic
			recipes.
		</p>
	</div>

	<div class="grid w-full max-w-5xl gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Our Specialties</CardTitle>
				<CardDescription>Signature dishes you must try</CardDescription>
			</CardHeader>
			<CardContent>
				<ul class="list-inside list-disc">
					<li>Soft and fluffy idlis</li>
					<li>Crispy dosas</li>
					<li>Flavorful vadas</li>
					<li>Aromatic sambar</li>
				</ul>
			</CardContent>
			<CardFooter>
				<Button variant="outline" class="w-full" href="/dashboard">View Menu</Button>
			</CardFooter>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Visit Us</CardTitle>
				<CardDescription>Our location and hours</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="mb-4">123 Culinary Street<br />Foodville, FD 12345</p>
				<p>
					<strong>Hours:</strong><br />
					Monday-Saturday: 8am - 10pm<br />
					Sunday: 9am - 9pm
				</p>
			</CardContent>
			<CardFooter>
				<Button variant="outline" class="w-full">Get Directions</Button>
			</CardFooter>
		</Card>
	</div>

	<div class="mt-16">
		<Button variant="outline" class="mr-4">About Us</Button>
		<Button>Contact</Button>
	</div>
</div>
