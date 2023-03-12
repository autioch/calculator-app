# Calculator App

## Requirements
- created without using any third-party libraries
- capable of performing addition, subtraction, multiplication, division and exponentiation
- can be operated using mouse and keyboard

## Development
1. Clone the repository.
2. The application is directly in the main folder.
3. Run tests - see `spec/index.html` file.

## To do
- [x] MVP - inserting numbers, operators
- [x] tests
- [x] lighthouse
- [x] decimals
- [x] rounding
- [x] clearing/deleting
- [x] cursor at any place
- [ ] replace eval - implement proper tokenizer and RPN - this way brackets and other operations can be supported.
- [x] better error handling - in one place and for user
- [x] layout improvements
- [x] review TODO in the code
- [ ] detect user's decimal separator with `Intl.NumberFormat`
- [ ] allow configuration of decimal number precision
- [ ] unify notation of opertions 
- [x] list browsers supported, page info

## Ideas
- what about bigint
- dark mode
- calculation history