"""
Employer Model

Design decision: An "employer" is represented by a User with role='employer'
combined with a Company profile. There is no separate employer table.

The Company model (company_model.py) stores all employer-specific data.
The User model (user_model.py) stores authentication and identity data.

This file exists for structural completeness in the project layout.
"""
