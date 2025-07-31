import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import * as dispoanleDomains from "disposable-email-domains";

const dispoanleDomainSet = new Set(dispoanleDomains);

@ValidatorConstraint({name: 'isValidDomain',async: false})
export class IsValidDomainConstraint implements ValidatorConstraintInterface {
    validate(email: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        if(!email){
            return true;
        }

        const domain = email.split('@')[1];
        
        if(!domain){
            return false;
        }

        return !dispoanleDomainSet.has(domain);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return "Email address from such domain are not allowed."
    }
}