export interface GreetingUpdateDTO {
    id?: string | number | undefined,
    text?: string,
    variant?: string,
}

export interface GreetingAuthor {
    id: string
    first_name: string
    last_name: string
    display_name: string
}

export interface GreetingVariant {
    name: string
}

export interface AdminGreetingDTO {
    author_id: string
    author_name: string
    greeting: string
}

export interface UserProfileForm {
    first_name: string
    last_name: string
}

export interface UserUpdatePasswordForm {
    current_password: string
    password: string
    password_confirmation: string
}
