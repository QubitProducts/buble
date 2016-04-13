module.exports = [
	{
		description: 'transpiles block scoping inside loops with function bodies',

		input: `
			function log ( square ) {
				console.log( square );
			}

			for ( let i = 0; i < 10; i += 1 ) {
				const square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			}`,

		output: `
			function log ( square ) {
				console.log( square );
			}

			var loop = function ( i ) {
				var square = i * i;
				setTimeout( function () {
					log( square );
				}, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description: 'transpiles block-less for loops with block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) setTimeout( () => console.log( i ), i * 100 );`,

		output: `
			var loop = function ( i ) {
				setTimeout( function () { return console.log( i ); }, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description: 'transpiles block scoping inside loops without function bodies',

		input: `
			for ( let i = 0; i < 10; i += 1 ) {
				const square = i * i;
				console.log( square );
			}`,

		output: `
			for ( var i = 0; i < 10; i += 1 ) {
				var square = i * i;
				console.log( square );
			}`
	},

	{
		description: 'transpiles block-less for loops without block-scoped declarations inside function body',

		input: `
			for ( let i = 0; i < 10; i += 1 ) console.log( i );`,

		output: `
			for ( var i = 0; i < 10; i += 1 ) console.log( i );`
	},

	{
		description: 'preserves correct `this` and `arguments` inside block scoped loop (#10)',

		input: `
			for ( let i = 0; i < 10; i += 1 ) {
				console.log( this, arguments, i );
				setTimeout( function () {
					console.log( this, arguments, i );
				}, i * 100 );
			}`,

		output: `
			var arguments$1 = arguments;
			var this$1 = this;

			var loop = function ( i ) {
				console.log( this$1, arguments$1, i );
				setTimeout( function () {
					console.log( this, arguments, i );
				}, i * 100 );
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description: 'maintains value of for loop variables between iterations (#11)',

		input: `
			var fns = [];

			for ( let i = 0; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				i += 1;
			}`,

		output: `
			var fns = [];

			var loop = function ( i$1 ) {
				fns.push(function () { return i$1; });
				i$1 += 1;

				i = i$1;
			};

			for ( var i = 0; i < 10; i += 1 ) loop( i );`
	},

	{
		description: 'maintains value of for loop variables between iterations, with conflict (#11)',

		input: `
			var i = 'conflicting';
			var fns = [];

			for ( let i = 0; i < 10; i += 1 ) {
				fns.push(function () { return i; });
				i += 1;
			}`,

		output: `
			var i = 'conflicting';
			var fns = [];

			var loop = function ( i$2 ) {
				fns.push(function () { return i$2; });
				i$2 += 1;

				i$1 = i$2;
			};

			for ( var i$1 = 0; i$1 < 10; i$1 += 1 ) loop( i$1 );`
	},

	{
		description: 'handles break and continue inside block-scoped loops (#12)',

		input: `
			function foo () {
				for ( let i = 0; i < 10; i += 1 ) {
					if ( i % 2 ) continue;
					if ( i > 5 ) break;
					if ( i === 'potato' ) return 'huh?';
					setTimeout( () => console.log( i ) );
				}
			}`,

		output: `
			function foo () {
				var loop = function ( i ) {
					if ( i % 2 ) return;
					if ( i > 5 ) return 'break';
					if ( i === 'potato' ) return { v: 'huh?' };
					setTimeout( function () { return console.log( i ); } );
				};

				for ( var i = 0; i < 10; i += 1 ) {
					var returned = loop( i );

					if ( returned === 'break' ) break;
					if ( returned ) return returned.v;
				}
			}`
	}
];