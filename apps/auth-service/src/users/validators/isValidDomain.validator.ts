import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import disposableDomains from 'disposable-email-domains';

const disposableDomainSet = new Set(disposableDomains);

@ValidatorConstraint({ name: 'isValidDomain', async: false })
export class IsValidDomainConstraint implements ValidatorConstraintInterface {
  validate(email: string): Promise<boolean> | boolean {
    if (!email) {
      return true; // Let @IsNotEmpty() handle empty values
    }
    const domain = email.split('@')[1];
    if (!domain) {
      return false; // Invalid email format
    }
    return !disposableDomainSet.has(domain);
  }

  // ✅ Using ValidationArguments to create a better error message
  defaultMessage(args?: ValidationArguments): string {
    if (!args?.value) {
      // Return a safe, generic message if the value isn't available.
      return 'Email address from such a domain is not allowed.';
    }

    const domain = (args.value as string).split('@')[1];
    return `The email domain '${domain}' is not allowed. Please use a permanent email address.`;
  }
}
